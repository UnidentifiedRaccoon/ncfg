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
