"""Read pinned Cloud.ru secrets before deployment, without writing runtime files."""
import base64
import json
from pathlib import Path
import re
import urllib.error
import urllib.parse
import urllib.request

IAM_URL = 'https://iam.api.cloud.ru/api/v1/auth/token'
PAYLOAD_ORIGIN = 'https://secretmanager.api.cloud.ru'
CONFIG = Path('/etc/ncfg/secret-manager.json')

class SecretAccessError(RuntimeError):
    pass

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        raise SecretAccessError('Cloud.ru redirect rejected')

def request_json(url, body=None, token=None):
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = 'Bearer ' + token
    request = urllib.request.Request(url, data=json.dumps(body).encode() if body is not None else None,
                                     headers=headers)
    try:
        with urllib.request.build_opener(NoRedirect()).open(request, timeout=15) as response:
            data = response.read(1024 * 1024 + 1)
            if len(data) > 1024 * 1024:
                raise SecretAccessError('Cloud.ru response too large')
            return json.loads(data)
    except urllib.error.HTTPError as error:
        raise SecretAccessError('Cloud.ru HTTP ' + str(error.code)) from None
    except Exception:
        raise SecretAccessError('Cloud.ru request failed') from None

def environment(value):
    if not isinstance(value, dict) or not value:
        raise SecretAccessError('Cloud.ru invalid environment')
    for key, val in value.items():
        if not re.fullmatch(r'[A-Za-z_][A-Za-z0-9_]*', key) or not isinstance(val, str) or '\x00' in val:
            raise SecretAccessError('Cloud.ru invalid environment')
    return value

def decode_environment(response, project, path, version):
    try:
        secret = response['secret']
        projects = [secret[k] for k in ['project_id', 'projectId'] if k in secret]
        if (not projects or any(value != project for value in projects) or secret['path'] != path or
                response['version']['id'] != version or response['version']['state'] != 'ENABLED'):
            raise ValueError()
        data = base64.b64decode(response['payload'], validate=True)
        return environment(json.loads(data.decode('utf-8')))
    except Exception:
        raise SecretAccessError('Cloud.ru payload identity or format mismatch') from None

def load_runtime_environments(runtime, config_file=CONFIG):
    """No remote fallback: an enabled migration must fail closed on every error."""
    try:
        if not config_file.exists():
            return {s: json.loads((runtime/(s+'.json')).read_text()) for s in ['web', 'cms']}
        config = json.loads(config_file.read_text())
        project = config['projectId']
        if not isinstance(project, str) or not project.strip():
            raise ValueError()
        credentials_file = Path(config['credentialsFile'])
        if not credentials_file.is_absolute():
            raise ValueError()
        credentials = json.loads(credentials_file.read_text())
        if any(not isinstance(credentials.get(k), str) or not credentials[k].strip() for k in ['keyId', 'secret']):
            raise ValueError()
        bindings = config['bindings']
        if set(bindings) != {'web', 'cms'}:
            raise ValueError()
        for binding in bindings.values():
            if (not isinstance(binding['path'], str) or not re.fullmatch(r'[A-Za-z0-9_-]+(?:/[A-Za-z0-9_-]+)*', binding['path']) or
                    type(binding['version']) is not int or binding['version'] < 1):
                raise ValueError()
        auth = request_json(IAM_URL, body={k: credentials[k] for k in ['keyId', 'secret']})
        token = auth['access_token']
        if not isinstance(token, str) or not token.strip():
            raise ValueError()
        result = {}
        for service in ['web', 'cms']:
            binding = bindings[service]
            url = PAYLOAD_ORIGIN + '/v2/version/' + urllib.parse.quote(binding['path'], safe='/') + '?' + urllib.parse.urlencode({'projectId': project, 'version': binding['version']})
            response = request_json(url, token=token)
            result[service] = decode_environment(response, project, binding['path'], binding['version'])
        return result
    except Exception:
        raise SecretAccessError('Cloud.ru runtime configuration unavailable; current containers and cache unchanged') from None
