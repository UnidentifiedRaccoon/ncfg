#!/usr/bin/env python3
"""Receive the explicitly approved form settings encrypted to this VM.

No plaintext on the workstation, no environment file, no test messages.
"""
import base64
import hashlib
import hmac
import json
import os
from pathlib import Path
import smtplib
import socket
import ssl
import subprocess
import sys
from urllib.parse import urlsplit

ALLOWED = set('''STRAPI_WRITE_API_TOKEN BITRIX24_WEBHOOK_URL
BITRIX24_LEAD_ENABLED BITRIX24_LEAD_ORIGINATOR_ID BITRIX24_LEAD_SOURCE_ID
BITRIX24_LEAD_STAGE_ID BITRIX24_LEAD_TITLE GETCOURSE_API_KEY GETCOURSE_BASE_URL
GETCOURSE_DEAL_COST GETCOURSE_DEAL_FIELD_COMPANY GETCOURSE_DEAL_FIELD_FORM_TYPE
GETCOURSE_DEAL_FIELD_MESSAGE GETCOURSE_DEAL_FIELD_PAGE_URL GETCOURSE_DEAL_FIELD_POST_TITLE
GETCOURSE_DEAL_FIELD_QUESTION GETCOURSE_DEAL_FIELD_REQUEST_ID GETCOURSE_DEAL_FIELD_SOURCE
GETCOURSE_DEAL_PRODUCT_TITLE_LEAD GETCOURSE_DEAL_PRODUCT_TITLE_QUESTION GETCOURSE_DEAL_STATUS
GETCOURSE_SOURCE_VALUE LEADS_RECIPIENT_EMAILS POSTBOX_API_KEY_ID POSTBOX_API_KEY_SECRET
POSTBOX_FROM_EMAIL POSTBOX_SMTP_HOST POSTBOX_SMTP_PORT PORTFOLIO_PRESENTATION_URL'''.split())


def run(args, **kwargs):
    result = subprocess.run(args, capture_output=True, timeout=60, **kwargs)
    assert result.returncode == 0, 'Command failed; sensitive output suppressed'
    return result.stdout


def main():
    os.umask(0o077)
    assert os.geteuid() == 0 and socket.gethostname() == 'ncfg-app-01'
    chunks = json.load(sys.stdin)
    clear = bytearray()
    for chunk in chunks:
        clear.extend(run(['openssl', 'pkeyutl', '-decrypt', '-inkey',
                          '/root/ncfg-key-transfer/transport.key', '-pkeyopt',
                          'rsa_padding_mode:oaep', '-pkeyopt', 'rsa_oaep_md:sha256'],
                         input=base64.b64decode(chunk, validate=True)))
    values = json.loads(clear)
    clear[:] = b'\0' * len(clear)
    assert set(values) == ALLOWED
    assert all(isinstance(value, str) for value in values.values())
    cms_env = dict(item.split('=', 1) for item in json.loads(run([
        'docker', 'inspect', '--format', '{{json .Config.Env}}', 'ncfg-cloudru-cms'])))
    token_hash = hmac.new(cms_env['API_TOKEN_SALT'].encode(),
                          values['STRAPI_WRITE_API_TOKEN'].encode(), hashlib.sha512).hexdigest()
    cms_env = None
    query = ("SELECT count(*) FROM strapi_api_tokens WHERE access_key='" + token_hash +
             "' AND (expires_at IS NULL OR expires_at>now());")
    assert run(['docker', 'exec', '-i', '--user', 'postgres', 'ncfg-cloudru-postgres',
                'psql', '-X', '-U', 'ncfg_admin', '-d', 'strapi', '-At', '-v', 'ON_ERROR_STOP=1'],
               input=query.encode()).strip() == b'1'
    for name in ['BITRIX24_WEBHOOK_URL', 'GETCOURSE_BASE_URL']:
        parsed = urlsplit(values[name])
        assert parsed.scheme == 'https' and parsed.hostname and not parsed.username
    assert values['POSTBOX_SMTP_HOST'] == 'postbox.cloud.yandex.net'
    assert values['POSTBOX_SMTP_PORT'] == '465'
    config = Path('/etc/ncfg/runtime')
    config.mkdir(mode=0o700, exist_ok=True)
    target = config / 'forms.json'
    assert not target.exists(), 'Existing settings preserved'
    with target.open('x') as handle:
        json.dump(values, handle)
    os.chmod(target, 0o600)
    report = {'settingsTransferred': len(values), 'writeTokenMatchesRestoredDatabase': True,
              'serverConfigMode': '0600', 'testMessagesSent': 0, 'formsEnabled': False}
    try:
        with smtplib.SMTP_SSL(values['POSTBOX_SMTP_HOST'], 465, timeout=20,
                              context=ssl.create_default_context()) as mail:
            mail.login(values['POSTBOX_API_KEY_ID'], values['POSTBOX_API_KEY_SECRET'])
        report['smtpTlsAuthentication'] = True
    except (OSError, smtplib.SMTPException) as error:
        report['smtpTlsAuthentication'] = False
        report['smtpErrorType'] = type(error).__name__
        if isinstance(error, smtplib.SMTPResponseException):
            report['smtpStatus'] = error.smtp_code
    values = None
    Path('/srv/ncfg/migration/form-settings-verification.json').write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps(report))


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        import traceback
        print(json.dumps({'error': type(error).__name__,
                          'line': traceback.extract_tb(error.__traceback__)[-1].lineno,
                          'details': 'sensitive output suppressed'}), file=sys.stderr)
        raise SystemExit(1)
