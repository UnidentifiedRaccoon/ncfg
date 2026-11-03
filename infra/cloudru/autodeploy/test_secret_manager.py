"""Secret retrieval must fail closed without altering the working runtime cache."""
import base64
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import secret_manager as sm
import deploy

PROJECT = 'project-fixture'
CREDS = {'keyId': 'fixture-id', 'secret': 'private-fixture'}

def payload(path, value):
    return {'secret': {'projectId': PROJECT, 'path': path, 'id': 'fixture-id'},
            'version': {'id': 1, 'state': 'ENABLED'},
            'payload': base64.b64encode(json.dumps(value).encode()).decode()}

class SecretManagerTests(unittest.TestCase):
    def test_reads_pinned_environments_without_altering_cache(self):
        self.assertTrue(hasattr(sm, 'load_runtime_environments'))
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            runtime = root/'runtime'; runtime.mkdir()
            for service in ['web', 'cms']:
                (runtime/(service+'.json')).write_text('{"OLD":"cache"}')
            (root/'credentials.json').write_text(json.dumps(CREDS))
            config = {'projectId': PROJECT, 'credentialsFile': str(root/'credentials.json'),
                      'bindings': {s: {'path': 'ncfg/production-'+s, 'version': 1} for s in ['web','cms']}}
            (root/'secret-manager.json').write_text(json.dumps(config))
            def request(url, body=None, token=None):
                if url == 'https://iam.api.cloud.ru/api/v1/auth/token':
                    self.assertEqual(body, CREDS); return {'access_token':'temporary-fixture'}
                self.assertEqual(token, 'temporary-fixture')
                service = 'cms' if '/production-cms?' in url else 'web'
                self.assertIn('projectId=project-fixture&version=1', url)
                return payload('ncfg/production-'+service, {'TOKEN': service+'-fixture'})
            with patch.object(sm, 'request_json', side_effect=request):
                result = sm.load_runtime_environments(runtime, root/'secret-manager.json')
            self.assertEqual(result, {'web': {'TOKEN':'web-fixture'}, 'cms': {'TOKEN':'cms-fixture'}})
            self.assertEqual((runtime/'web.json').read_text(), '{"OLD":"cache"}')

    def test_unavailable_remote_never_silently_uses_old_cache(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root/'web.json').write_text('{"OLD":"cache"}')
            (root/'cms.json').write_text('{"OLD":"cache"}')
            (root/'credentials.json').write_text(json.dumps(CREDS))
            config = {'projectId': PROJECT, 'credentialsFile':str(root/'credentials.json'),
                      'bindings': {s:{'path':'ncfg/production-'+s,'version':1} for s in ['web','cms']}}
            (root/'config.json').write_text(json.dumps(config))
            with patch.object(sm, 'request_json', side_effect=RuntimeError('private-fixture')):
                with self.assertRaises(sm.SecretAccessError) as caught:
                    sm.load_runtime_environments(root, root/'config.json')
            self.assertNotIn('private-fixture', str(caught.exception))
            self.assertIsNone(caught.exception.__cause__)
            self.assertEqual((root/'web.json').read_text(), '{"OLD":"cache"}')

    def test_validates_payload_identity_version_and_environment_values(self):
        valid = payload('ncfg/production-web', {'TOKEN':'fixture'})
        for invalid in [
            {**valid,'secret':{**valid['secret'],'projectId':'wrong'}},
            {**valid,'secret':{**valid['secret'],'path':'ncfg/production-cms'}},
            {**valid,'version':{'id':2,'state':'ENABLED'}},
            {**valid,'version':{'id':1,'state':'DISABLED'}},
            {**valid,'payload':'%%%bad'},
            payload('ncfg/production-web', {'TOKEN':123}),
            payload('ncfg/production-web', {'TOKEN':'with\x00nul'}),
            payload('ncfg/production-web', {'BAD=KEY':'fixture'}),
        ]:
            with self.assertRaises(sm.SecretAccessError):
                sm.decode_environment(invalid, PROJECT, 'ncfg/production-web', 1)
        self.assertEqual(sm.decode_environment(valid, PROJECT, 'ncfg/production-web', 1), {'TOKEN':'fixture'})

    def test_real_api_uses_snake_case_project_identity(self):
        response=payload('ncfg/production-web',{'TOKEN':'fixture'})
        response['secret']['project_id']=response['secret'].pop('projectId')
        self.assertEqual(sm.decode_environment(response,PROJECT,'ncfg/production-web',1),{'TOKEN':'fixture'})
        response['secret']['projectId']='wrong-project'
        with self.assertRaises(sm.SecretAccessError):
            sm.decode_environment(response,PROJECT,'ncfg/production-web',1)

    def test_existing_file_configuration_remains_available_before_migration(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp)
            for service in ['web','cms']:(root/(service+'.json')).write_text('{"TOKEN":"fixture"}')
            self.assertEqual(sm.load_runtime_environments(root, root/'absent.json'),
                             {'web':{'TOKEN':'fixture'},'cms':{'TOKEN':'fixture'}})

class DeploymentSecretTests(unittest.TestCase):
    def test_secret_failure_stops_deployment_before_checkout_or_container_changes(self):
        with patch.object(deploy, 'load_runtime_environments', create=True,
                          side_effect=sm.SecretAccessError('Cloud.ru denied')), \
                patch.object(deploy, 'publish_status'), \
                patch.object(deploy, 'checkout', side_effect=RuntimeError('checkout reached before secrets')) as checkout, \
                patch.object(deploy, 'docker') as docker:
            with self.assertRaises(sm.SecretAccessError):
                deploy.deploy('a'*40, {})
            checkout.assert_not_called()
            docker.assert_not_called()

class RotationTests(unittest.TestCase):
    def test_cms_environment_changes_reuse_image_even_without_source_changes(self):
        container = {'Image':'sha256:existing', 'Config':{'Env':['PATH=/bin','TOKEN=old','REMOVED=old']}}
        image = {'Config':{'Env':['PATH=/bin']}}
        with patch.object(deploy, 'docker', side_effect=[json.dumps([container]).encode(),json.dumps([image]).encode()]):
            self.assertEqual(deploy.cms_image_for_environment({'TOKEN':'new'}),'sha256:existing')
        container['Config']['Env']=['PATH=/bin','TOKEN=new']
        with patch.object(deploy, 'docker', side_effect=[json.dumps([container]).encode(),json.dumps([image]).encode()]):
            self.assertIsNone(deploy.cms_image_for_environment({'TOKEN':'new'}))
        container['Config']['Env'].append('REMOVED=old')
        with patch.object(deploy, 'docker', side_effect=[json.dumps([container]).encode(),json.dumps([image]).encode()]):
            self.assertEqual(deploy.cms_image_for_environment({'TOKEN':'new'}),'sha256:existing')

    def test_website_release_activates_new_cms_environment_after_backup(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp);(root/'apps/web/public').mkdir(parents=True)
            (root/'transaction.json').write_text('{}')
            original_read=Path.read_text
            def read(path, *args, **kwargs):
                if str(path)=='/srv/ncfg/backups/last-offsite-success.json':
                    return '{"databaseRoundtripPassed":true}'
                return original_read(path,*args,**kwargs)
            events=[]
            def activate(*args):
                events.append('activate');return {'id':'rotation','previous':{'cms':'old-cms','web':'old-web'}}
            with patch.object(deploy,'ROOT',root), patch.object(deploy,'publish_status'), \
                    patch.object(deploy,'load_runtime_environments',return_value={'cms':{'TOKEN':'new'},'web':{}}), \
                    patch.object(deploy,'checkout',return_value=(root,'same-tree')), patch.object(deploy,'docker'), \
                    patch.object(deploy,'cms_image_for_environment',return_value='existing-cms'), \
                    patch.object(deploy,'build_image',return_value='new-web') as build, \
                    patch.object(deploy,'desired',return_value='a'*40), \
                    patch.object(deploy,'run',side_effect=lambda *a,**kw:events.append('backup')), \
                    patch.object(Path,'read_text',read), patch.object(deploy,'activate',side_effect=activate) as switch:
                deploy.deploy('a'*40,{'cmsTree':'same-tree'})
            self.assertEqual(events,['backup','activate'])
            self.assertEqual([c.args[1] for c in build.call_args_list],['web'])
            self.assertEqual(switch.call_args.args[1],{'cms':'existing-cms','web':'new-web'})
            self.assertEqual(switch.call_args.args[2]['cms'],{'TOKEN':'new'})
            self.assertEqual(json.loads((root/'active.json').read_text())['transactionId'],'rotation')

    def test_same_revision_rotation_recovers_uncommitted_transaction(self):
        with tempfile.TemporaryDirectory() as tmp, patch.object(deploy, 'ROOT', Path(tmp)), patch.object(deploy,'restore_container') as restore:
            deploy.write_json(Path(tmp)/'active.json',{'revision':'a'*40,'transactionId':'previous'})
            deploy.write_json(Path(tmp)/'transaction.json',{'revision':'a'*40,'id':'new','previous':{'cms':'previous-cms'}})
            deploy.recover_transaction()
            restore.assert_called_once_with('cms','previous-cms')

    def test_committed_rotation_is_not_rolled_back(self):
        with tempfile.TemporaryDirectory() as tmp, patch.object(deploy, 'ROOT', Path(tmp)), patch.object(deploy,'restore_container') as restore:
            deploy.write_json(Path(tmp)/'active.json',{'revision':'a'*40,'transactionId':'new'})
            deploy.write_json(Path(tmp)/'transaction.json',{'revision':'a'*40,'id':'new','previous':{'cms':'previous-cms'}})
            deploy.recover_transaction()
            restore.assert_not_called()

    def test_explicit_refresh_does_not_skip_current_revision(self):
        with tempfile.TemporaryDirectory() as tmp, patch.object(deploy,'ROOT',Path(tmp)), \
                patch.object(deploy.os,'geteuid',return_value=0), patch.object(deploy.socket,'gethostname',return_value='ncfg-app-01'), \
                patch.object(deploy.os.path,'ismount',return_value=True), patch.object(deploy,'desired',return_value='a'*40), \
                patch.object(deploy,'prepare_disk'), patch.object(deploy,'cleanup_old_releases'), \
                patch.object(deploy,'maintain_release_retention'), patch.object(deploy,'publish_status'), patch.object(deploy,'deploy') as run:
            deploy.write_json(Path(tmp)/'active.json',{'revision':'a'*40})
            deploy.main(refresh_secrets=True)
            run.assert_called_once()
            self.assertEqual(run.call_args.args[0],'a'*40)

if __name__ == '__main__': unittest.main()
