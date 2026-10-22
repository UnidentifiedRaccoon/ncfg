import importlib.util
import io
import json
from pathlib import Path
import tarfile
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('deploy', Path(__file__).with_name('deploy.py'))
deploy = importlib.util.module_from_spec(spec)
spec.loader.exec_module(deploy)


class DeploymentTests(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        patcher = patch.object(deploy, 'PUBLIC_STATUS', Path(temporary.name) / 'deployment-status.json')
        patcher.start()
        self.addCleanup(patcher.stop)

    def test_cache_cleanup_targets_only_old_default_builder_cache(self):
        from types import SimpleNamespace
        with patch.object(deploy.shutil, 'disk_usage', side_effect=[
                SimpleNamespace(free=3 * 1024**3), SimpleNamespace(free=5 * 1024**3)]), \
                patch.object(deploy, 'docker') as docker:
            deploy.prepare_disk('a' * 40)
        docker.assert_called_once_with('buildx', 'prune', '--builder', 'default', '--filter',
                                       'until=24h', '--reserved-space', '1GB', '--force', timeout=600)
        status = json.loads(deploy.PUBLIC_STATUS.read_text())
        self.assertEqual(status['freeBytes'], 5 * 1024**3)
        self.assertEqual(status['state'], 'running')

    def test_low_disk_is_recorded_and_published_before_checkout_or_container_changes(self):
        from types import SimpleNamespace
        with tempfile.TemporaryDirectory() as temporary, patch.object(deploy, 'ROOT', Path(temporary)), \
                patch.object(deploy.os, 'geteuid', return_value=0), \
                patch.object(deploy.socket, 'gethostname', return_value='ncfg-app-01'), \
                patch.object(deploy.os.path, 'ismount', return_value=True), \
                patch.object(deploy, 'recover_transaction'), \
                patch.object(deploy, 'desired', return_value='a' * 40), \
                patch.object(deploy.shutil, 'disk_usage', return_value=SimpleNamespace(free=3 * 1024**3)), \
                patch.object(deploy, 'docker') as docker, patch.object(deploy, 'deploy') as release:
            active = Path(temporary) / 'active.json'
            deploy.write_json(active, {'revision': 'b' * 40})
            before = active.read_bytes()
            with self.assertRaises(deploy.DeploymentFailure):
                deploy.main()
            self.assertEqual(active.read_bytes(), before)
            release.assert_not_called()
            self.assertEqual(docker.call_count, 1)
            failure = json.loads((Path(temporary) / 'failed.json').read_text())
            self.assertEqual(failure['code'], 'insufficient_disk')
            self.assertEqual(failure['revision'], 'a' * 40)
            status = json.loads(deploy.PUBLIC_STATUS.read_text())
            self.assertEqual(status['state'], 'failed')
            self.assertEqual(status['freeBytes'], 3 * 1024**3)
            self.assertEqual(status['requiredBytes'], 4 * 1024**3)
            deploy.main()  # Recorded failure stays visible; no pruning every timer tick.
            self.assertEqual(docker.call_count, 1)

    def test_prune_failure_prevents_build_and_does_not_expose_command_output(self):
        with patch.object(deploy, 'docker', side_effect=RuntimeError('PRIVATE_CMS_DATA')), \
                patch.object(deploy.shutil, 'disk_usage'):
            with self.assertRaises(deploy.DeploymentFailure) as raised:
                deploy.prepare_disk('a' * 40)
        self.assertEqual(raised.exception.code, 'cache_cleanup_failed')
        self.assertNotIn('PRIVATE_CMS_DATA', str(raised.exception))

    def test_public_status_whitelists_fields_and_keeps_private_state_private(self):
        deploy.publish_status('a' * 40, 'failed', 'preflight', code='insufficient_disk',
                              freeBytes=123, requiredBytes=456, token='SECRET',
                              output='PRIVATE_CMS_DATA', exception='SECRET')
        text = deploy.PUBLIC_STATUS.read_text()
        self.assertNotIn('SECRET', text)
        self.assertNotIn('PRIVATE', text)
        self.assertEqual(deploy.PUBLIC_STATUS.stat().st_mode & 0o777, 0o644)
        private = deploy.PUBLIC_STATUS.with_name('private.json')
        deploy.write_json(private, {'token': 'SECRET'})
        self.assertEqual(private.stat().st_mode & 0o777, 0o600)

    def test_build_resolves_current_cms_private_ip_instead_of_public_hairpin(self):
        with patch.object(deploy, 'docker', return_value=b'{"ncfg-cloudru-application":{"IPAddress":"172.19.0.2"}}'):
            self.assertEqual(deploy.build_cms_url(), 'http://172.19.0.2:8080')
        with patch.object(deploy, 'docker', return_value=b'{"ncfg-cloudru-application":{"IPAddress":"45.151.30.122"}}'):
            with self.assertRaises(RuntimeError):
                deploy.build_cms_url()

    def test_gateway_verification_keeps_tls_validation_without_public_hairpin(self):
        with patch.object(deploy, 'run', return_value=b'{"revision":"test"}\n200') as run:
            self.assertEqual(deploy.gateway_request('ncfg.ru', '/deployment.json'), b'{"revision":"test"}')
        args = run.call_args.args[0]
        self.assertIn('ncfg.ru:443:127.0.0.1', args)
        self.assertIn('https://ncfg.ru/deployment.json', args)
        self.assertNotIn('--insecure', args)
        self.assertNotIn('-k', args)
        with patch.object(deploy, 'run', return_value=b'redirect\n301'):
            with self.assertRaises(RuntimeError):
                deploy.gateway_request('ncfg.ru', '/')

    def test_sandbox_and_installer_share_docker_config_outside_home(self):
        directory = Path(__file__).parent
        service = (directory / 'ncfg-autodeploy.service').read_text()
        installer = (directory / 'install.sh').read_text()
        self.assertIn('ProtectHome=true', service)
        self.assertIn('Environment=DOCKER_CONFIG=/etc/ncfg/autodeploy-docker', service)
        self.assertIn('export DOCKER_CONFIG=/etc/ncfg/autodeploy-docker', installer)
        self.assertIn('RequiresMountsFor=/srv/ncfg', service)
        self.assertIn('--opt device=/srv/ncfg/buildkit-cache', installer)

    def test_only_approved_current_main_is_deployable(self):
        sha = 'a' * 40
        self.assertEqual(deploy.approved_revision(f'{sha}\trefs/heads/main\n{sha}\trefs/heads/cloudru-production\n'), sha)
        for refs in [f'{sha}\trefs/heads/main\n',
                     f'{sha}\trefs/heads/main\n' + 'b' * 40 + '\trefs/heads/cloudru-production\n',
                     'bad\trefs/heads/main\nbad\trefs/heads/cloudru-production\n']:
            self.assertIsNone(deploy.approved_revision(refs))

    def test_archive_rejects_traversal_and_links(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            for name, kind in [('../outside', tarfile.REGTYPE), ('link', tarfile.SYMTYPE)]:
                with tarfile.open(root / 'source.tar', 'w') as archive:
                    member = tarfile.TarInfo(name)
                    member.type = kind
                    member.linkname = '/etc/passwd' if kind == tarfile.SYMTYPE else ''
                    archive.addfile(member, io.BytesIO())
                with self.assertRaises(RuntimeError):
                    deploy.extract_source(root / 'source.tar', root / 'source')
            self.assertFalse((root.parent / 'outside').exists())

    def test_runtime_values_are_not_in_docker_arguments_or_public_ports(self):
        with patch.object(deploy, 'docker') as docker:
            deploy.start_container('web', 'candidate', 'sha256:' + 'b' * 64, {'TOKEN': 'PRIVATE_VALUE'})
        args, kwargs = docker.call_args_list[0]
        self.assertNotIn('PRIVATE_VALUE', ' '.join(args))
        self.assertEqual(kwargs['env']['TOKEN'], 'PRIVATE_VALUE')
        self.assertNotIn('--publish', args)
        self.assertNotIn('--privileged', args)
        self.assertIn('ALL', args)

    def test_readiness_failure_rolls_back_every_replaced_container(self):
        with tempfile.TemporaryDirectory() as temporary, patch.object(deploy, 'ROOT', Path(temporary)), \
                patch.object(deploy, 'docker', return_value=b'container'), \
                patch.object(deploy, 'start_container'), \
                patch.object(deploy, 'healthy', side_effect=[None, RuntimeError('unhealthy')]), \
                patch.object(deploy, 'restore_container') as restore:
            with self.assertRaises(RuntimeError):
                deploy.activate('a' * 40, {'web': 'web-image', 'cms': 'cms-image'}, {'web': {}, 'cms': {}})
            self.assertEqual([call.args[0] for call in restore.call_args_list], ['web', 'cms'])
            self.assertFalse((Path(temporary) / 'transaction.json').exists())

    def test_public_check_failure_rolls_back_even_if_container_is_healthy(self):
        with tempfile.TemporaryDirectory() as temporary, patch.object(deploy, 'ROOT', Path(temporary)), \
                patch.object(deploy, 'docker', return_value=b'container'), patch.object(deploy, 'start_container'), \
                patch.object(deploy, 'healthy'), patch.object(deploy, 'public_check', side_effect=RuntimeError()), \
                patch.object(deploy, 'restore_container') as restore:
            with self.assertRaises(RuntimeError):
                deploy.activate('a' * 40, {'web': 'web-image'}, {'web': {}})
            self.assertEqual(restore.call_args.args[0], 'web')

    def test_interrupted_transaction_recovers_before_next_deploy(self):
        with tempfile.TemporaryDirectory() as temporary, patch.object(deploy, 'ROOT', Path(temporary)), \
                patch.object(deploy, 'restore_container') as restore:
            journal = Path(temporary) / 'transaction.json'
            deploy.write_json(journal, {'revision': 'a' * 40, 'previous': {'web': 'old-web'}})
            deploy.recover_transaction()
            restore.assert_called_once_with('web', 'old-web')
            self.assertFalse(journal.exists())

    def test_failed_restore_keeps_recovery_journal(self):
        with tempfile.TemporaryDirectory() as temporary, patch.object(deploy, 'ROOT', Path(temporary)), \
                patch.object(deploy, 'restore_container', side_effect=RuntimeError('Docker unavailable')):
            journal = Path(temporary) / 'transaction.json'
            deploy.write_json(journal, {'previous': {'web': 'old-web'}})
            with self.assertRaises(RuntimeError):
                deploy.recover_transaction()
            self.assertTrue(journal.exists())

    def test_committed_release_is_not_rolled_back_after_journal_cleanup_crash(self):
        with tempfile.TemporaryDirectory() as temporary, patch.object(deploy, 'ROOT', Path(temporary)), \
                patch.object(deploy, 'restore_container') as restore:
            deploy.write_json(Path(temporary) / 'active.json', {'revision': 'a' * 40})
            deploy.write_json(Path(temporary) / 'transaction.json', {'revision': 'a' * 40, 'previous': {'web': 'old'}})
            deploy.recover_transaction()
            restore.assert_not_called()

    def test_build_failure_never_stops_live_containers(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            (root / 'apps/web/public').mkdir(parents=True)
            for service in ['web', 'cms']:
                (root / (service + '.json')).write_text('{}')
            with patch.object(deploy, 'RUNTIME', root), patch.object(deploy, 'checkout', return_value=(root, 'tree')), \
                    patch.object(deploy, 'docker') as docker, \
                    patch.object(deploy, 'build_image', side_effect=RuntimeError('build failed')), \
                    patch.object(deploy, 'activate') as activate:
                with self.assertRaises(RuntimeError):
                    deploy.deploy('a' * 40, {})
                activate.assert_not_called()
                self.assertTrue(all(call.args[0] == 'cp' for call in docker.call_args_list))

    def test_superseded_revision_is_not_activated_after_build(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            (root / 'apps/web/public').mkdir(parents=True)
            for service in ['web', 'cms']:
                (root / (service + '.json')).write_text('{}')
            with patch.object(deploy, 'RUNTIME', root), patch.object(deploy, 'checkout', return_value=(root, 'tree')), \
                    patch.object(deploy, 'docker'), patch.object(deploy, 'build_image', return_value='image'), \
                    patch.object(deploy, 'desired', return_value='b' * 40), patch.object(deploy, 'activate') as activate:
                deploy.deploy('a' * 40, {'cmsTree': 'tree'})
                activate.assert_not_called()


if __name__ == '__main__':
    unittest.main()
