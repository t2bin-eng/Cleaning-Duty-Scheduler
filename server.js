import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';

const port = Number(process.argv[2] || 5173);
const root = process.cwd();

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
};

function resolvePath(url) {
  const pathname = decodeURIComponent(new URL(url, `http://localhost:${port}`).pathname);
  const requestedPath = normalize(join(root, pathname));

  if (!requestedPath.startsWith(root)) {
    return null;
  }

  if (!existsSync(requestedPath)) {
    return join(root, 'index.html');
  }

  if (statSync(requestedPath).isDirectory()) {
    return join(requestedPath, 'index.html');
  }

  return requestedPath;
}

createServer((request, response) => {
  const filePath = resolvePath(request.url);

  if (!filePath || !existsSync(filePath)) {
    response.writeHead(404);
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
