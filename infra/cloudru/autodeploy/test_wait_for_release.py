import importlib.util
import io
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('wait_for_release', Path(__file__).with_name('wait_for_release.py'))
waiter = importlib.util.module_from_spec(spec)
spec.loader.exec_module(waiter)
REVISION = 'a' * 40


def status(state='running', **kwargs):
    return {'schema': 1, 'revision': REVISION, 'state': state, 'stage': 'preflight', **kwargs}


class WaitTests(unittest.TestCase):
    def setUp(self):
        self.now = 0
        clock = patch.object(waiter.time, 'monotonic', side_effect=lambda: self.now)
        sleep = patch.object(waiter.time, 'sleep', side_effect=self.advance)
        clock.start()
        sleep.start()
        self.addCleanup(clock.stop)
        self.addCleanup(sleep.stop)

    def advance(self, seconds):
        self.now += seconds

    def test_insufficient_disk_fails_on_first_poll_with_concrete_reason(self):
        failed = status('failed', code='insufficient_disk', freeBytes=3 * 1024**3, requiredBytes=4 * 1024**3)
        with patch.object(waiter, 'fetch_json', return_value=failed), \
                patch.object(waiter, 'verify_public') as verify:
            with self.assertRaisesRegex(waiter.ReleaseFailure, '3.00 GiB free; 4.00 GiB required'):
                waiter.wait_for_release(REVISION)
            verify.assert_not_called()
        self.assertEqual(self.now, 0)

    def test_fetch_timeout_has_safe_actionable_message(self):
        failed = status('failed', stage='checkout', code='git_fetch_timeout', timeoutSeconds=600,
                        output='PRIVATE_OUTPUT')
        with patch.object(waiter, 'fetch_json', return_value=failed), \
                patch.object(waiter, 'verify_public') as verify:
            with self.assertRaisesRegex(waiter.ReleaseFailure, 'Git fetch timed out after 600 seconds') as raised:
                waiter.wait_for_release(REVISION)
            self.assertNotIn('PRIVATE', str(raised.exception))
            verify.assert_not_called()
        self.assertEqual(self.now, 0)
        for value in ('PRIVATE', True, -1, 3601):
            message = waiter.failure_message({**failed, 'timeoutSeconds': value})
            self.assertNotIn(str(value), message)
            self.assertIn('Git fetch timed out;', message)

    def test_stale_other_revision_failure_is_ignored(self):
        values = [status('failed', revision='b' * 40), status('running'), status('succeeded', stage='complete')]
        with patch.object(waiter, 'fetch_json', side_effect=values), \
                patch.object(waiter, 'verify_public', return_value=True) as verify:
            waiter.wait_for_release(REVISION)
            verify.assert_called_once_with(REVISION)
        self.assertEqual(self.now, 20)

    def test_no_supervisor_acknowledgement_fails_after_three_minutes(self):
        with patch.object(waiter, 'fetch_json', return_value=status(revision='b' * 40)):
            with self.assertRaisesRegex(waiter.ReleaseFailure, 'did not acknowledge'):
                waiter.wait_for_release(REVISION)
        self.assertEqual(self.now, 180)

    def test_status_unavailable_fails_without_waiting_forty_minutes(self):
        with patch.object(waiter, 'fetch_json', side_effect=OSError('network')):
            with self.assertRaisesRegex(waiter.ReleaseFailure, 'did not acknowledge'):
                waiter.wait_for_release(REVISION)
        self.assertEqual(self.now, 180)

    def test_malformed_status_is_treated_as_unavailable(self):
        for malformed in [[], status(state=[]), status(stage={}), status(schema=True),
                          status(revision=['a' * 40])]:
            self.assertFalse(waiter.validate_status(malformed))
        with patch.object(waiter, 'fetch_json', return_value=status(state=[])):
            with self.assertRaisesRegex(waiter.ReleaseFailure, 'did not acknowledge'):
                waiter.wait_for_release(REVISION)

    def test_status_lost_after_acknowledgement_has_a_bounded_wait(self):
        values = iter([status('running', stage='build_web')])
        with patch.object(waiter, 'fetch_json', side_effect=lambda _: next(values, None)):
            with self.assertRaisesRegex(waiter.ReleaseFailure, 'status has been unavailable'):
                waiter.wait_for_release(REVISION)
        self.assertEqual(self.now, 180)

    def test_public_health_alone_does_not_win_during_activation(self):
        values = [status('running', stage='verify'), status('failed', stage='verify')]
        with patch.object(waiter, 'fetch_json', side_effect=values), \
                patch.object(waiter, 'verify_public', return_value=True) as verify:
            with self.assertRaisesRegex(waiter.ReleaseFailure, 'stage verify'):
                waiter.wait_for_release(REVISION)
            verify.assert_not_called()

    def test_success_requires_independent_public_verification(self):
        with patch.object(waiter, 'fetch_json', return_value=status('succeeded', stage='complete')), \
                patch.object(waiter, 'verify_public', side_effect=[False, True]) as verify:
            waiter.wait_for_release(REVISION)
            self.assertEqual(verify.call_count, 2)

    def test_server_output_is_not_copied_to_github_annotation_or_summary(self):
        failed = status('failed', message='PRIVATE\n::warning::injected', code='PRIVATE')
        with tempfile.TemporaryDirectory() as temporary, \
                patch.dict(waiter.os.environ, {'REVISION': REVISION, 'GITHUB_STEP_SUMMARY': temporary + '/summary'}), \
                patch.object(waiter, 'fetch_json', return_value=failed), \
                patch('sys.stdout', new_callable=io.StringIO) as output:
            self.assertEqual(waiter.main(), 1)
            self.assertIn('::error title=Cloud.ru deployment::', output.getvalue())
            self.assertNotIn('PRIVATE', output.getvalue())
            self.assertNotIn('injected', Path(temporary + '/summary').read_text())


if __name__ == '__main__':
    unittest.main()
