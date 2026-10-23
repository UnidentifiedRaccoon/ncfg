#!/usr/bin/env python3
"""Offline failure-injection tests; no Docker, S3, SSH or real credentials."""
import contextlib
import importlib.util
import io
import json
from pathlib import Path
import subprocess
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import Mock, patch

HERE = Path(__file__).resolve().parent


def load(name):
    spec = importlib.util.spec_from_file_location(name, HERE / (name + '.py'))
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class RuntimeRollbackTests(unittest.TestCase):
    def scenario(self, failure=None):
        runtime = load('configure-production-runtime')
        name = runtime.PREFIX + 'web'
        old = name + '-before-test'
        containers = {name: 'original', 'unrelated': 'other'}
        running = {'original', 'other'}
        calls = []
        failed = False

        def docker(args):
            nonlocal failed
            calls.append(args)
            op = args[0]
            trigger = op == failure or (op == 'rename' and failure == 'rename-timeout')
            if trigger and not failed:
                failed = True
                if failure == 'rename-timeout':
                    containers[args[2]] = containers.pop(args[1])
                if failure == 'stop':
                    running.discard(containers[args[-1]])
                raise RuntimeError('Injected Docker failure')
            if op == 'ps':
                target = args[-1][6:-1]
                return containers.get(target, '').encode()
            if op == 'inspect':
                return containers[args[-1]].encode() if args[2] == '{{.Id}}' else (
                    b'unhealthy' if failure == 'health' else b'healthy')
            if op == 'stop':
                running.discard(containers[args[-1]])
            elif op == 'rename':
                if args[2] in containers:
                    raise RuntimeError('Name occupied')
                containers[args[2]] = containers.pop(args[1])
            elif op == 'start':
                running.add(containers.get(args[1], args[1]))
            return b''

        def create(*args):
            if failure == 'create':
                raise RuntimeError('Injected create failure')
            containers[name] = 'replacement'
            running.add('replacement')
            if failure == 'create-partial':
                raise RuntimeError('Injected error after creation')

        with patch.object(runtime, 'run', side_effect=docker), patch.object(runtime.time, 'sleep'), \
                patch.object(runtime.subprocess, 'run', side_effect=AssertionError('External process forbidden')):
            if failure:
                with self.assertRaises(RuntimeError):
                    runtime.replace_service(SimpleNamespace(container=create), 'web', 'image', {}, '-before-test')
                self.assertEqual(containers[name], 'original')
                self.assertIn('original', running)
                self.assertNotIn(old, containers)
                self.assertNotIn('replacement', running)
            else:
                self.assertEqual(runtime.replace_service(SimpleNamespace(container=create), 'web', 'image', {}, '-before-test'), old)
                self.assertEqual(containers[old], 'original')
                self.assertEqual(containers[name], 'replacement')
                self.assertNotIn('original', running)
            self.assertEqual(containers['unrelated'], 'other')
            self.assertIn('other', running)
        return calls

    def test_stop_failure(self):
        self.scenario('stop')

    def test_rename_failure(self):
        self.scenario('rename')

    def test_rename_completed_before_timeout(self):
        self.scenario('rename-timeout')

    def test_create_failure(self):
        self.scenario('create')

    def test_partial_creation_failure(self):
        self.scenario('create-partial')

    def test_network_failure(self):
        self.scenario('network')

    def test_readiness_failure(self):
        self.scenario('health')

    def test_success_preserves_old_container(self):
        self.scenario()

    def test_existing_rollback_container_blocks_changes(self):
        runtime = load('configure-production-runtime')
        with patch.object(runtime, 'run', return_value=b'existing') as run:
            with self.assertRaises(RuntimeError):
                runtime.replace_service(Mock(), 'web', 'image', {}, '-before-test')
            self.assertEqual(len(run.call_args_list), 1)

    def test_docker_error_remains_failure_with_optimization(self):
        runtime = load('configure-production-runtime')
        with patch.object(runtime.subprocess, 'run', return_value=SimpleNamespace(returncode=1, stdout=b'sensitive')):
            with self.assertRaisesRegex(RuntimeError, 'sensitive output suppressed'):
                runtime.run(['inspect', 'fake'])


class BackupTests(unittest.TestCase):
    def test_preconditions_before_any_io(self):
        for uid, hostname, mounted in [(1, 'ncfg-app-01', True), (0, 'wrong', True), (0, 'ncfg-app-01', False)]:
            with self.subTest(uid=uid, hostname=hostname, mounted=mounted):
                backup = load('backup-running-stack')
                with patch.object(backup.os, 'umask'), patch.object(backup.os, 'geteuid', return_value=uid), \
                        patch.object(backup.socket, 'gethostname', return_value=hostname), \
                        patch.object(backup.os.path, 'ismount', return_value=mounted), \
                        patch.object(Path, 'open', side_effect=AssertionError('Unexpected file access')), \
                        patch.object(backup.subprocess, 'run', side_effect=AssertionError('External process forbidden')):
                    with self.assertRaises(RuntimeError):
                        backup.main()

    def scenario(self, failure=None):
        backup = load('backup-running-stack')
        with tempfile.TemporaryDirectory() as tmp, contextlib.ExitStack() as stack:
            root = Path(tmp)
            (root / 'backups').mkdir()
            config = root / 'config'
            config.mkdir()
            (config / 'media.json').write_text('{}')
            (config / 'backup.json').write_text(json.dumps(dict(tenantId='test', keyId='test', keySecret='fake-test-only')))
            report = root / 'backups/last-offsite-success.json'
            report.write_text('{"previous": true}\n')
            client = Mock()
            client.get_paginator.return_value.paginate.return_value = []
            storage = SimpleNamespace(client=lambda _: client)
            spec = SimpleNamespace(loader=SimpleNamespace(exec_module=lambda _: None))
            commands = []

            def process(args, **kwargs):
                command = 'pg_dump' if args[0] == 'docker' else args[7]
                commands.append(command)
                output = b''
                if command == 'pg_dump':
                    kwargs['stdout'].write(b'test database dump')
                elif command == 'backup':
                    output = b'{"message_type":"summary","snapshot_id":"test-snapshot"}\n'
                elif command == 'dump':
                    output = b'corrupt' if failure == 'checksum' else b'test database dump'
                elif command != 'check':
                    raise AssertionError('Unexpected command')
                if failure == 'timeout' and command == 'pg_dump':
                    raise subprocess.TimeoutExpired('mock pg_dump', 600)
                return SimpleNamespace(returncode=1 if command == failure else 0, stdout=output)

            for target, attr, value in [(backup, 'ROOT', root), (backup, 'CONFIG', config)]:
                stack.enter_context(patch.object(target, attr, value))
            stack.enter_context(patch.object(backup.os, 'umask'))
            stack.enter_context(patch.object(backup.os, 'geteuid', return_value=0))
            stack.enter_context(patch.object(backup.socket, 'gethostname', return_value='ncfg-app-01'))
            stack.enter_context(patch.object(backup.os.path, 'ismount', return_value=True))
            stack.enter_context(patch.object(backup.importlib.util, 'spec_from_file_location', return_value=spec))
            stack.enter_context(patch.object(backup.importlib.util, 'module_from_spec', return_value=storage))
            stack.enter_context(patch.object(backup.subprocess, 'run', side_effect=process))
            stack.enter_context(contextlib.redirect_stdout(io.StringIO()))
            if failure:
                with self.assertRaises((RuntimeError, subprocess.TimeoutExpired)):
                    backup.main()
                self.assertEqual(report.read_text(), '{"previous": true}\n')
                self.assertEqual(len(list((root / 'backups').glob('*.dump'))), 1)
                if failure in ('pg_dump', 'timeout'):
                    self.assertEqual(commands, ['pg_dump'])
                if failure == 'checksum':
                    self.assertNotIn('check', commands)
            else:
                backup.main()
                self.assertTrue(json.loads(report.read_text())['databaseRoundtripPassed'])
                self.assertEqual(list((root / 'backups').glob('*.dump*')), [])
                self.assertEqual(commands, ['pg_dump', 'backup', 'dump', 'check'])

    def test_pg_dump_failure(self):
        self.scenario('pg_dump')

    def test_pg_dump_timeout(self):
        self.scenario('timeout')

    def test_restic_backup_failure(self):
        self.scenario('backup')

    def test_restic_dump_failure(self):
        self.scenario('dump')

    def test_checksum_mismatch(self):
        self.scenario('checksum')

    def test_restic_check_failure(self):
        self.scenario('check')

    def test_success_removes_dump_only_after_validation(self):
        self.scenario()


if __name__ == '__main__':
    unittest.main()
