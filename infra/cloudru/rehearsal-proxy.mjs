// Local-only gateway for the archived production images. No external upstreams.
import http from 'node:http';
import { readFileSync, createReadStream } from 'node:fs';
import path from 'node:path';

const root = '/rehearsal/media';
const manifest = JSON.parse(readFileSync(path.join(root, 'manifest.json'), 'utf8'));
const objects = new Map(manifest.objects.map(item => [item.key, item]));
const oldOrigin = `https://storage.yandexcloud.net/${manifest.bucket}`;
const mediaOrigin = 'http://localhost:18080/media';
const csp = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: http://localhost:18080; font-src 'self' data:; connect-src 'self' http://localhost:18080 http://localhost:18081; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'";

function headers(res) {
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('X-Ncfg-Rehearsal', 'isolated-local-copy');
  res.setHeader('Content-Security-Policy', csp);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-store');
}

function mediaKey(url) {
  for (const prefix of [oldOrigin + '/', mediaOrigin + '/', `https://${manifest.bucket}.storage.yandexcloud.net/`]) {
    if (url.startsWith(prefix)) return decodeURIComponent(url.slice(prefix.length).split('?')[0]);
  }
  return null;
}

function serveMedia(key, req, res) {
  const entry = objects.get(key);
  if (!entry) { res.writeHead(404); res.end('Media absent from saved archive'); return; }
  const file = path.resolve(root, entry.path);
  if (!file.startsWith(root + '/')) { res.writeHead(400); res.end(); return; }
  const contentType = entry.headers?.['Content-Type'] || entry.headers?.['content-type'] || 'application/octet-stream';
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Length', entry.size);
  res.setHeader('ETag', `"${entry.sha256}"`);
  if (req.method === 'HEAD') res.end();
  else createReadStream(file).on('error', () => res.destroy()).pipe(res);
}

function rewrite(text) {
  return text.replaceAll(oldOrigin, mediaOrigin)
    .replaceAll(`https://${manifest.bucket}.storage.yandexcloud.net`, mediaOrigin)
    .replaceAll('https://admin.ncfg.ru', 'http://localhost:18081')
    .replaceAll('https://www.ncfg.ru', 'http://localhost:18080')
    .replaceAll('https://ncfg.ru', 'http://localhost:18080');
}

function createGateway(port, upstream, publicPort) {
  http.createServer((req, res) => {
    headers(res);
    let url;
    try { url = new URL(req.url, `http://localhost:${publicPort}`); }
    catch { res.writeHead(400); res.end(); return; }
    if (upstream === 'web' && !['GET', 'HEAD'].includes(req.method)) {
      // Website forms are disabled; CMS changes affect only the isolated restored database.
      res.writeHead(405, { Allow: 'GET, HEAD' }); res.end('Mutations disabled in local rehearsal'); return;
    }
    if (url.pathname.startsWith('/media/')) {
      try { serveMedia(decodeURIComponent(url.pathname.slice(7)), req, res); }
      catch { res.writeHead(400); res.end(); }
      return;
    }
    if (upstream === 'web' && url.pathname === '/_next/image') {
      let key;
      try { key = mediaKey(url.searchParams.get('url') || ''); } catch { key = null; }
      if (key !== null) { serveMedia(key, req, res); return; }
      const source = url.searchParams.get('url') || '';
      if (!source.startsWith('/') || source.startsWith('//')) {
        res.writeHead(424); res.end('External images disabled in rehearsal'); return;
      }
    }
    const requestHeaders = { ...req.headers, host: upstream === 'web' ? 'ncfg.ru' : 'localhost:18081',
      'accept-encoding': 'identity', 'x-forwarded-host': upstream === 'web' ? 'ncfg.ru' : 'localhost:18081',
      'x-forwarded-proto': upstream === 'web' ? 'https' : 'http' };
    delete requestHeaders.connection;
    const remote = http.request({ hostname: upstream, port: 8080, path: req.url, method: req.method,
      headers: requestHeaders, timeout: 60000 }, incoming => {
      const body = [];
      let bytes = 0;
      incoming.on('data', chunk => {
        bytes += chunk.length;
        if (bytes > 32 * 1024 * 1024) { remote.destroy(); res.destroy(); return; }
        body.push(chunk);
      });
      incoming.on('end', () => {
        for (const [key, value] of Object.entries(incoming.headers)) {
          if (!['content-length', 'content-encoding', 'connection', 'transfer-encoding', 'content-security-policy',
            'x-robots-tag', 'cache-control', 'etag'].includes(key) && value !== undefined) {
            res.setHeader(key, key === 'location' ? rewrite(String(value)) : value);
          }
        }
        let data = Buffer.concat(body);
        if (/text\/html|application\/json|text\/x-component/.test(String(incoming.headers['content-type']))) {
          data = Buffer.from(rewrite(data.toString('utf8')));
        }
        res.statusCode = incoming.statusCode || 502;
        res.setHeader('Content-Length', data.length);
        res.end(req.method === 'HEAD' ? undefined : data);
      });
      incoming.on('error', () => res.destroy());
    });
    remote.on('timeout', () => remote.destroy());
    remote.on('error', () => { if (!res.headersSent) res.writeHead(502); res.end('Local upstream unavailable'); });
    req.pipe(remote);
  }).listen(port, '0.0.0.0');
}

createGateway(8080, 'web', 18080);
createGateway(8081, 'cms', 18081);
console.log('Local gateway ready: website forms and external integrations blocked.');
