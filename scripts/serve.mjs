import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = process.env.PASSFABRICATOR_WEB_ROOT
  ? resolve(process.env.PASSFABRICATOR_WEB_ROOT)
  : fileURLToPath(new URL('../dist/', import.meta.url));
const PORT = Number(process.env.PASSFABRICATOR_PORT || 4173);
const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png'
};

async function handleRequest(request, response) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }
  try {
    const URL_PATH = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const PATH = resolve(ROOT, `.${URL_PATH === '/' ? '/index.html' : URL_PATH}`);
    if (!PATH.startsWith(`${resolve(ROOT)}${sep}`)) {
      response.writeHead(403).end();
      return;
    }
    const CONTENT = await readFile(PATH);
    response.writeHead(200, { 'Content-Type': CONTENT_TYPES[extname(PATH)] || 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
    response.end(request.method === 'HEAD' ? undefined : CONTENT);
  } catch {
    response.writeHead(404).end();
  }
}

function main() {
  if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) throw new Error('Invalid development server port.');
  const SERVER = createServer((request, response) => { void handleRequest(request, response); });
  SERVER.listen(PORT, '127.0.0.1', () => { console.log(`PassFabricator: http://127.0.0.1:${PORT}`); });
}

main();
