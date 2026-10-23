#!/usr/bin/env python3
"""Observe sanitized supervisor status, then independently verify the public release."""
import json
import os
import re
import time
import urllib.error
import urllib.request
from pathlib import Path


STAGES = {'preflight', 'cleanup', 'checkout', 'build_cms', 'build_web', 'backup',
          'activate', 'verify', 'complete', 'recovery'}
NETWORK_ERRORS = (OSError, ValueError, TimeoutError)


class ReleaseFailure(RuntimeError):
    pass


def fetch_json(url):
    request = urllib.request.Request(url + '?t=' + str(time.time_ns()),
                                     headers={'Cache-Control': 'no-cache'})
    with urllib.request.urlopen(request, timeout=10) as response:
        return json.load(response)


def verify_public(expected):
    deployed = fetch_json('https://ncfg.ru/deployment.json')
    if not isinstance(deployed, dict) or deployed.get('revision') != expected:
        return False
    for url in ('https://ncfg.ru/api/health', 'https://admin.ncfg.ru/_health'):
        with urllib.request.urlopen(url, timeout=10) as response:
            if response.status not in (200, 204):
                return False
    return True


def validate_status(value):
    return (isinstance(value, dict) and type(value.get('schema')) is int and value['schema'] == 1
            and isinstance(value.get('revision'), str)
            and re.fullmatch('[0-9a-f]{40}', value['revision']) is not None
            and isinstance(value.get('state'), str) and isinstance(value.get('stage'), str)
            and value.get('state') in {'running', 'failed', 'succeeded', 'superseded'}
            and value.get('stage') in STAGES)


def failure_message(status):
    # Never echo arbitrary server messages, exception strings or build output.
    stage = status['stage']
    if status.get('code') == 'insufficient_disk':
        values = [status.get('freeBytes'), status.get('requiredBytes')]
        if all(type(value) is int and 0 <= value <= 2**63 for value in values):
            return ('Insufficient Docker disk space after automatic old-cache cleanup: '
                    f'{values[0] / 1024**3:.2f} GiB free; {values[1] / 1024**3:.2f} GiB required. '
                    'The active release and retained rollback versions are preserved. Data volumes were not pruned.')
        return 'Insufficient Docker disk space after automatic old-cache cleanup; previous release remains active.'
    if status.get('code') == 'git_fetch_timeout':
        seconds = status.get('timeoutSeconds')
        duration = f' after {seconds} seconds' if type(seconds) is int and 0 < seconds <= 3600 else ''
        return ('Git fetch timed out' + duration + '; no build or activation started. '
                'Inspect Git connectivity and leftover locks before an operator retries.')
    if status.get('code') == 'cache_cleanup_failed':
        return 'Automatic old build-cache cleanup failed; deployment stopped before the build.'
    if status.get('code') == 'retention_cleanup_failed':
        return 'Automatic old release cleanup failed; deployment stopped before the build. The active release is unchanged.'
    return f'Cloud.ru deployment failed at stage {stage}; inspect the root-only server journal.'


def wait_for_release(expected, timeout=40 * 60, signal_timeout=180, poll_interval=10):
    if not re.fullmatch('[0-9a-f]{40}', expected):
        raise ValueError('Expected a full commit SHA')
    started = time.monotonic()
    deadline = started + timeout
    last_signal = started
    acknowledged = False
    last_progress = None
    while time.monotonic() < deadline:
        try:
            status = fetch_json('https://ncfg.ru/deployment-status.json')
        except NETWORK_ERRORS:
            status = None
        if validate_status(status) and status['revision'] == expected:
            acknowledged = True
            last_signal = time.monotonic()
            if status['state'] == 'failed':
                raise ReleaseFailure(failure_message(status))
            if status['state'] == 'superseded':
                raise ReleaseFailure('This revision was superseded before activation.')
            progress = (status['state'], status['stage'])
            if progress != last_progress:
                print(f'Cloud.ru {expected}: {progress[0]} / {progress[1]}', flush=True)
                last_progress = progress
            if status['state'] == 'succeeded':
                try:
                    if verify_public(expected):
                        return
                except NETWORK_ERRORS:
                    pass
        if time.monotonic() - last_signal >= signal_timeout:
            if acknowledged:
                raise ReleaseFailure('Cloud.ru deployment status has been unavailable for 3 minutes; '
                                     'inspect the supervisor and HTTPS status endpoint.')
            raise ReleaseFailure('Cloud.ru supervisor did not acknowledge this revision within 3 minutes; '
                                 'inspect ncfg-autodeploy.service and /deployment-status.json.')
        time.sleep(poll_interval)
    stage = last_progress[1] if last_progress else 'not acknowledged'
    raise ReleaseFailure(f'Cloud.ru deployment exceeded 40 minutes; last stage: {stage}.')


def main():
    expected = os.environ['REVISION']
    try:
        wait_for_release(expected)
    except (ReleaseFailure, ValueError) as error:
        message = str(error)
        print('::error title=Cloud.ru deployment::' + message, flush=True)
        if os.environ.get('GITHUB_STEP_SUMMARY'):
            with Path(os.environ['GITHUB_STEP_SUMMARY']).open('a') as summary:
                summary.write('### Cloud.ru deployment failed\n\n' + message + '\n')
        return 1
    print('Cloud.ru is serving verified revision ' + expected, flush=True)
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
