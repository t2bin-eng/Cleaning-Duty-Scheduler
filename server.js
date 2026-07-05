import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, relative } from 'node:path';

const port = Number(process.argv[2] || 5173);
const root = process.cwd();

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
};

function resolvePath(url, request) {
  const pathname = decodeURIComponent(new URL(url, `http://localhost:${port}`).pathname);
  const relativePath = pathname.replace(/^\/+/, '') || 'index.html';
  const requestedPath = normalize(join(root, relativePath));
  const rootRelativePath = relative(root, requestedPath);

  if (rootRelativePath.startsWith('..') || rootRelativePath === '..') {
    return null;
  }

  if (!existsSync(requestedPath)) {
    const acceptsHtml = request.headers.accept?.includes('text/html');
    const looksLikeAsset = extname(requestedPath);
    return acceptsHtml && !looksLikeAsset ? join(root, 'index.html') : null;
  }

  if (statSync(requestedPath).isDirectory()) {
    return join(requestedPath, 'index.html');
  }

  return requestedPath;
}

createServer((request, response) => {
  const filePath = resolvePath(request.url, request);

  if (!filePath || !existsSync(filePath)) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
    return;
  }

  response.writeHead(200, {
    'Content-Type': contentTypes[extname(filePath)] || 'application/octet-stream',
  });
  createReadStream(filePath).pipe(response);
}).listen(port, () => {
  console.log(`Cleaning Zone Planner running at http://localhost:${port}`);
});
