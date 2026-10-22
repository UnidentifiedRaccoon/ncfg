import importlib.util
import json
import os
from pathlib import Path
import stat
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('install_status', Path(__file__).with_name('install_status.py'))
installer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(installer)


class StatusInstallerTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)
        values = {'ROOT': self.root, 'AUTODEPLOY': self.root / 'autodeploy',
                  'CONFIG': self.root / 'migration/Caddyfile', 'CADDY_CONFIG': self.root / 'caddy-config',
                  'PUBLIC_DIRECTORY': self.root / 'caddy-config/ncfg-public-status',
                  'STATUS': self.root / 'caddy-config/ncfg-public-status/deployment-status.json'}
        for key, value in values.items():
            context = patch.object(installer, key, value)
            context.start()
            self.addCleanup(context.stop)
        installer.AUTODEPLOY.mkdir()
        installer.CADDY_CONFIG.mkdir()
        installer.CONFIG.parent.mkdir()
        installer.CONFIG.write_text(installer.ORIGINAL_CONFIG)
        (installer.AUTODEPLOY / 'active.json').write_text(json.dumps({
            'revision': 'a' * 40, 'images': {'web': 'private-image-metadata'},
            'private': 'MUST_NOT_BECOME_PUBLIC'}))
        self.directory_patch = patch.object(installer, 'directory')
        self.directory_patch.start()
        self.addCleanup(self.directory_patch.stop)
        self.guards_patch = patch.object(installer, 'guards')
        self.guards_patch.start()
        self.addCleanup(self.guards_patch.stop)

    def test_route_is_exact_and_preserves_admin_off_and_other_hosts(self):
        result = installer.candidate_config(installer.ORIGINAL_CONFIG)
        self.assertIn('handle /deployment-status.json {', result)
        self.assertNotIn('/deployment-status.json*', result)
        self.assertIn('root * /config/ncfg-public-status', result)
        self.assertIn('header Cache-Control "no-store"', result)
        self.assertIn('header X-Robots-Tag "noindex, nofollow"', result)
        self.assertIn('admin off', result)
        self.assertIn('handle {\n\t\treverse_proxy web:8080', result)
        self.assertEqual(result.split('www.')[1], installer.ORIGINAL_CONFIG.split('www.')[1])
        self.assertEqual(installer.candidate_config(result), result)
        with self.assertRaises(RuntimeError):
            installer.candidate_config(installer.ORIGINAL_CONFIG.replace('web:8080', 'unknown:8080'))

    def test_initializer_publishes_only_whitelisted_active_identity(self):
        installer.initialize_status()
        value = json.loads(installer.STATUS.read_text())
        self.assertEqual(set(value), {'schema', 'revision', 'state', 'stage', 'updatedAt'})
        self.assertEqual(value['revision'], 'a' * 40)
        self.assertEqual((value['schema'], value['state'], value['stage']), (1, 'succeeded', 'complete'))
        self.assertNotIn('MUST_NOT_BECOME_PUBLIC', installer.STATUS.read_text())
        self.assertEqual(stat.S_IMODE(installer.STATUS.stat().st_mode), 0o644)
        installer.validate_public_status(value)

    def test_invalid_active_or_symlink_status_cannot_be_published(self):
        (installer.AUTODEPLOY / 'active.json').write_text('{"revision":"invalid"}')
        with self.assertRaises(RuntimeError):
            installer.initialize_status()
        self.assertFalse(installer.STATUS.exists())
        installer.STATUS.symlink_to(installer.AUTODEPLOY / 'active.json')
        with self.assertRaises(RuntimeError):
            installer.initialize_status()

    def test_existing_status_with_extra_fields_is_rejected(self):
        installer.initialize_status()
        value = json.loads(installer.STATUS.read_text())
        for extra in ({'private': 'secret'}, {'freeBytes': True}, {'code': 'private error text'}):
            with self.assertRaises(RuntimeError):
                installer.validate_public_status({**value, **extra})

    def test_success_validates_candidate_then_same_inode_and_uses_signal(self):
        before = installer.CONFIG.stat().st_ino
        with patch.object(installer, 'validate') as validate, patch.object(installer, 'reload_caddy') as reload, \
                patch.object(installer, 'verify_status'):
            installer.install()
        self.assertTrue(str(validate.call_args_list[0].args[0]).startswith('/config/.ncfg-status-'))
        self.assertEqual(validate.call_args_list[1].args[0], '/etc/caddy/Caddyfile')
        reload.assert_called_once()
        self.assertEqual(installer.CONFIG.stat().st_ino, before)
        self.assertEqual(installer.CONFIG.read_text(), installer.INSTALLED_CONFIG)
        backups = list(installer.AUTODEPLOY.glob('caddy-before-status-*.Caddyfile'))
        self.assertEqual(len(backups), 1)
        self.assertEqual(backups[0].read_text(), installer.ORIGINAL_CONFIG)
        self.assertEqual(stat.S_IMODE(backups[0].stat().st_mode), 0o600)
        self.assertFalse(list(installer.CADDY_CONFIG.glob('.ncfg-status-*')))

    def test_candidate_validation_failure_never_changes_running_config(self):
        with patch.object(installer, 'validate', side_effect=RuntimeError()), \
                patch.object(installer, 'reload_caddy') as reload:
            with self.assertRaises(RuntimeError):
                installer.install()
        self.assertEqual(installer.CONFIG.read_text(), installer.ORIGINAL_CONFIG)
        reload.assert_not_called()
        self.assertFalse(list(installer.AUTODEPLOY.glob('caddy-before-status-*')))

    def test_public_verification_failure_restores_same_inode_and_reloads(self):
        before = installer.CONFIG.stat().st_ino
        with patch.object(installer, 'validate'), patch.object(installer, 'reload_caddy') as reload, \
                patch.object(installer, 'verify_status', side_effect=RuntimeError()):
            with self.assertRaises(RuntimeError):
                installer.install()
        self.assertEqual(installer.CONFIG.read_text(), installer.ORIGINAL_CONFIG)
        self.assertEqual(installer.CONFIG.stat().st_ino, before)
        self.assertEqual(reload.call_count, 2)

    def test_idempotent_run_preserves_existing_status_and_does_not_reload(self):
        installer.CONFIG.write_text(installer.INSTALLED_CONFIG)
        installer.initialize_status()
        before = installer.STATUS.read_bytes()
        real_regular_file = installer.regular_file
        def root_owned(path):
            value = real_regular_file(path)
            if path == installer.STATUS:
                fields = list(value)
                fields[4] = 0
                return os.stat_result(fields)
            return value
        with patch.object(installer, 'regular_file', side_effect=root_owned), \
                patch.object(installer, 'validate') as validate, patch.object(installer, 'reload_caddy') as reload, \
                patch.object(installer, 'verify_status'):
            installer.install()
        validate.assert_not_called()
        reload.assert_not_called()
        self.assertEqual(installer.STATUS.read_bytes(), before)

    def test_unknown_config_is_rejected_before_public_initialization(self):
        installer.CONFIG.write_text(installer.ORIGINAL_CONFIG + '\nunknown directive\n')
        with self.assertRaises(RuntimeError):
            installer.install()
        self.assertFalse(installer.PUBLIC_DIRECTORY.exists())

    def test_changed_inode_is_rejected_without_truncating_replacement(self):
        original = installer.CONFIG.stat()
        identity = (original.st_dev, original.st_ino)
        replacement = installer.CONFIG.with_suffix('.replacement')
        replacement.write_text('newer configuration')
        replacement.replace(installer.CONFIG)
        with self.assertRaises(RuntimeError):
            installer.replace_in_place('unexpected', identity)
        self.assertEqual(installer.CONFIG.read_text(), 'newer configuration')

    def test_host_and_mount_guard(self):
        self.guards_patch.stop()
        with patch.object(installer.os, 'geteuid', return_value=1000):
            with self.assertRaises(RuntimeError):
                installer.guards()
        mounts = [{'Type': 'bind', 'Source': str(installer.CONFIG), 'Destination': '/etc/caddy/Caddyfile', 'RW': False},
                  {'Type': 'bind', 'Source': str(installer.CADDY_CONFIG), 'Destination': '/config', 'RW': True}]
        command = ['caddy', 'run', '--config', '/etc/caddy/Caddyfile', '--adapter', 'caddyfile']
        with patch.object(installer.os, 'geteuid', return_value=0), \
                patch.object(installer.socket, 'gethostname', return_value='ncfg-app-01'), \
                patch.object(installer.os.path, 'ismount', return_value=True), \
                patch.object(installer, 'run', side_effect=[json.dumps(mounts).encode(), json.dumps(command).encode(), b'v2.11.7 test']):
            installer.guards()
        mounts[0]['RW'] = True
        with patch.object(installer.os, 'geteuid', return_value=0), \
                patch.object(installer.socket, 'gethostname', return_value='ncfg-app-01'), \
                patch.object(installer.os.path, 'ismount', return_value=True), \
                patch.object(installer, 'run', return_value=json.dumps(mounts).encode()):
            with self.assertRaises(RuntimeError):
                installer.guards()

    def test_reload_only_sends_usr1_without_restarting_container(self):
        with patch.object(installer, 'run') as run:
            installer.reload_caddy()
        run.assert_called_once_with(['docker', 'kill', '--signal=USR1', 'ncfg-cloudru-https'])


if __name__ == '__main__':
    unittest.main()
