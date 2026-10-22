import copy
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('deploy_retention', Path(__file__).with_name('deploy.py'))
deploy = importlib.util.module_from_spec(spec)
spec.loader.exec_module(deploy)
NOW = deploy.retention_timestamp('2026-10-23T00:00:00Z')


def image_id(number):
    return 'sha256:' + f'{number:064x}'


def container(service, number, finished='2026-10-20T00:00:00Z', kind='release', managed='true'):
    return {'id': f'{number:064x}', 'name': f'/ncfg-cloudru-{service}-{kind}-{number}',
            'image': image_id(number), 'status': 'exited', 'health': 'healthy',
            'finished': finished, 'managed': managed}


def image(number, service='web', created='2026-10-18T00:00:00Z'):
    revision = f'{number:040x}'
    return {'id': image_id(number), 'tags': [f'ncfg-autodeploy-{service}:{revision}'],
            'revision': revision, 'created': created, 'managed': 'true'}


class RetentionTests(unittest.TestCase):
    def setUp(self):
        self.active = {'revision': 'a' * 40, 'images': {'web': image_id(1), 'cms': image_id(2)},
                       'previousContainers': {'web': 'ncfg-cloudru-web-release-3'}}
        web, cms = container('web', 1), container('cms', 2)
        for service, current in [('web', web), ('cms', cms)]:
            current.update(name='/ncfg-cloudru-' + service, status='running')
        self.containers = [web, cms, container('web', 3, '2026-10-22T22:00:00Z'),
                           container('web', 4, '2026-10-22T21:00:00Z'), container('web', 5),
                           container('cms', 6, '2026-10-22T20:00:00Z'),
                           container('cms', 7, '2026-10-21T00:00:00Z', managed=None)]
        self.images = [image(n, 'cms' if n in (2, 6, 7, 8) else 'web') for n in range(1, 10)]

    def plan(self):
        return deploy.retention_plan(self.active, self.containers, self.images, NOW)

    def test_keeps_two_previous_versions_per_service_including_legacy_cms(self):
        plan = self.plan()
        self.assertEqual(plan['containers'], [f'{5:064x}'])
        self.assertEqual(set(plan['images']), {image_id(5), image_id(8), image_id(9)})
        self.assertIn('ncfg-cloudru-cms-release-7', plan['keepPreviousContainers'])
        # Input/creation order does not decide rollback recency.
        self.containers.reverse()
        self.assertEqual(self.plan(), plan)

    def test_any_other_container_reference_protects_image(self):
        extra = container('gateway', 50, managed=None)
        extra['image'] = image_id(8)
        self.containers.append(extra)
        self.assertNotIn(image_id(8), self.plan()['images'])
        self.assertNotIn(extra['id'], self.plan()['containers'])

    def test_explicit_rollback_reference_is_protected_even_if_older(self):
        self.active['previousContainers']['web'] = 'ncfg-cloudru-web-release-5'
        self.assertEqual(self.plan()['containers'], [])
        self.assertNotIn(image_id(5), self.plan()['images'])

    def test_unmanaged_and_unknown_name_containers_are_not_deleted(self):
        self.containers[4]['managed'] = None
        self.containers.append(container('web', 55, kind='before-runtime'))
        self.assertEqual(self.plan()['containers'], [])

    def test_failed_container_grace_starts_at_finish_not_creation(self):
        old = container('web', 10, kind='failed')
        recent = container('cms', 11, '2026-10-22T23:00:00Z', kind='failed')
        self.containers.extend([old, recent])
        plan = self.plan()
        self.assertIn(old['id'], plan['containers'])
        self.assertNotIn(recent['id'], plan['containers'])

    def test_unused_images_require_age_managed_label_and_exact_tags(self):
        for override in [{'created': '2026-10-22T23:00:00Z'}, {'managed': None},
                         {'revision': 'unknown'}, {'tags': []}, {'tags': ['operator:keep']}]:
            with self.subTest(override=override):
                images = copy.deepcopy(self.images)
                images[7].update(override)
                plan = deploy.retention_plan(self.active, self.containers, images, NOW)
                self.assertNotIn(image_id(8), plan['images'])
        self.images[7]['tags'].append('operator:keep')
        self.assertNotIn(image_id(8), self.plan()['images'])

    def test_unknown_state_transaction_and_unhealthy_service_fail_closed(self):
        cases = [({}, self.containers, False), (self.active, [], False),
                 (self.active, self.containers, True)]
        unhealthy = copy.deepcopy(self.containers)
        unhealthy[0]['health'] = 'unhealthy'
        cases.append((self.active, unhealthy, False))
        mismatch = copy.deepcopy(self.containers)
        mismatch[0]['image'] = image_id(99)
        cases.append((self.active, mismatch, False))
        for active, containers, transaction in cases:
            plan = deploy.retention_plan(active, containers, self.images, NOW, transaction)
            self.assertTrue(plan['skipped'])
            self.assertEqual(plan['containers'], [])
            self.assertEqual(plan['images'], [])

    def test_apply_removes_container_then_image_without_force_or_volumes(self):
        plan = {'containers': ['old-container'], 'images': ['old-image'], 'skipped': None}
        with patch.object(deploy, 'current_retention_plan', return_value=plan), \
                patch.object(deploy, 'retention_inventory', return_value=([], [])), \
                patch.object(deploy, 'docker') as docker:
            result = deploy.cleanup_old_releases()
        self.assertEqual([call.args for call in docker.call_args_list],
                         [('container', 'rm', 'old-container'), ('image', 'rm', 'old-image')])
        self.assertEqual(result, {'containers': 1, 'images': 1, 'skipped': None})

    def test_recheck_preserves_new_reference_even_if_new_plan_would_delete_it(self):
        plan = {'containers': [], 'images': [image_id(8)], 'skipped': None}
        with patch.object(deploy, 'current_retention_plan', return_value=plan), \
                patch.object(deploy, 'retention_inventory', return_value=([{'image': image_id(8)}], [])), \
                patch.object(deploy, 'docker') as docker:
            self.assertEqual(deploy.cleanup_old_releases()['images'], 0)
            docker.assert_not_called()

    def test_recheck_preserves_container_that_is_no_longer_eligible(self):
        initial = {'containers': ['old-container'], 'images': [], 'skipped': None}
        changed = {'containers': [], 'images': [], 'skipped': None}
        with patch.object(deploy, 'current_retention_plan', side_effect=[initial, changed]), \
                patch.object(deploy, 'docker') as docker:
            self.assertEqual(deploy.cleanup_old_releases()['containers'], 0)
            docker.assert_not_called()

    def test_idle_maintenance_does_not_turn_success_into_failure(self):
        with patch.object(deploy, 'cleanup_old_releases', side_effect=RuntimeError('PRIVATE')), \
                patch.object(deploy, 'publish_status') as publish:
            deploy.maintain_release_retention()
            publish.assert_not_called()

    def test_web_only_release_preserves_cms_rollback_record(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            (root / 'apps/web/public').mkdir(parents=True)
            (root / 'transaction.json').write_text('{}')
            for service in ('web', 'cms'):
                (root / (service + '.json')).write_text('{}')
            active = {**self.active, 'cmsTree': 'same-tree',
                      'previousContainers': {'web': 'old-web', 'cms': 'keep-cms'}}
            with patch.object(deploy, 'ROOT', root), patch.object(deploy, 'RUNTIME', root), \
                    patch.object(deploy, 'PUBLIC_STATUS', root / 'public.json'), \
                    patch.object(deploy, 'checkout', return_value=(root, 'same-tree')), \
                    patch.object(deploy, 'docker'), patch.object(deploy, 'build_image', return_value=image_id(9)), \
                    patch.object(deploy, 'desired', return_value='a' * 40), \
                    patch.object(deploy, 'activate', return_value={'previous': {'web': 'new-previous-web'}}):
                deploy.deploy('a' * 40, active)
            state = json.loads((root / 'active.json').read_text())
            self.assertEqual(state['previousContainers'], {'web': 'new-previous-web', 'cms': 'keep-cms'})
            self.assertEqual(state['images']['cms'], active['images']['cms'])

    def test_retention_preflight_failure_stops_build_and_publishes_safe_code(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            (root / 'active.json').write_text(json.dumps(self.active))
            with patch.object(deploy, 'ROOT', root), patch.object(deploy, 'PUBLIC_STATUS', root / 'public.json'), \
                    patch.object(deploy.os, 'geteuid', return_value=0), \
                    patch.object(deploy.socket, 'gethostname', return_value='ncfg-app-01'), \
                    patch.object(deploy.os.path, 'ismount', return_value=True), \
                    patch.object(deploy, 'recover_transaction'), \
                    patch.object(deploy, 'desired', return_value='b' * 40), \
                    patch.object(deploy, 'cleanup_old_releases', side_effect=RuntimeError('PRIVATE')), \
                    patch.object(deploy, 'prepare_disk') as disk, patch.object(deploy, 'deploy') as release:
                with self.assertRaises(deploy.DeploymentFailure):
                    deploy.main()
                disk.assert_not_called()
                release.assert_not_called()
            status = json.loads((root / 'public.json').read_text())
            self.assertEqual(status['code'], 'retention_cleanup_failed')
            self.assertNotIn('PRIVATE', (root / 'public.json').read_text())


if __name__ == '__main__':
    unittest.main()
