// Serves the built site (`app/build/`) on http://localhost:4173 the way GitHub Pages does, for trying a build and
// for the smoke tests: `/scales` is `scales.html`, `/` is `index.html`, and a path with no file gets `404.html`, the
// app's fallback page, with a 404 status. `npm run preview` runs it, after `npm run build`. It listens on this
// computer only.
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../build');
const port = 4173;

const TYPES: Record<string, string> = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json',
    '.webmanifest': 'application/manifest+json',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.ico': 'image/x-icon',
    '.woff2': 'font/woff2'
};

/** The file a path names inside the build, as Pages finds it, or `undefined`. */
async function find(pathname: string): Promise<string | undefined> {
    const file = path.join(root, decodeURIComponent(pathname));
    const inside = path.relative(root, file);
    if (inside.startsWith('..') || path.isAbsolute(inside)) return undefined;
    for (const candidate of [file, `${file}.html`, path.join(file, 'index.html')]) {
        const info = await stat(candidate).catch(() => undefined);
        if (info?.isFile()) return candidate;
    }
    return undefined;
}

createServer((request, response) => {
    void (async () => {
        const { pathname } = new URL(request.url ?? '/', 'http://localhost');
        const found = await find(pathname).catch(() => undefined);
        const file = found ?? path.join(root, '404.html');
        const stream = createReadStream(file);
        stream.on('error', () => {
            // No build yet, or the file went away mid-request.
            if (!response.headersSent) response.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
            response.end('Nothing to serve: run `npm run build` first.\n');
        });
        stream.on('open', () => {
            response.writeHead(found ? 200 : 404, {
                'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream',
                'cache-control': 'no-cache'
            });
            stream.pipe(response);
        });
    })();
}).listen(port, '127.0.0.1', () => {
    console.log(`Serving ${root} on http://localhost:${String(port)}`);
});
