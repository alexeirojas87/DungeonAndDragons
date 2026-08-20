// ============================================================
// ASSET STREAM ROUTE
// Serves the visual library from the repo-root `Assests/`
// directory so Next.js can hand it out at /api/asset/<kind>/...
// without moving or renaming any file. The library lives outside
// /public, so this route is the only bridge between the filesystem
// and the browser. Assets are immutable: cache hard.
// ============================================================

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { NextResponse } from 'next/server';

const ASSET_ROOT = join(process.cwd(), 'Assests');

const MIME: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.json': 'application/json',
};

export async function GET(
  _req: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const segments = path ?? [];
  if (segments.length === 0) {
    return new NextResponse('not found', { status: 404 });
  }

  // Collapse to a single relative path and refuse traversal/absolutes: the
  // browser must never be able to read arbitrary filesystem paths.
  const relative = segments.join('/');
  if (relative.includes('..') || relative.startsWith('/') || relative.includes('\0')) {
    return new NextResponse('forbidden', { status: 403 });
  }

  const filePath = join(ASSET_ROOT, relative);
  if (!existsSync(filePath)) {
    return new NextResponse('not found', { status: 404 });
  }

  const ext = filePath.slice(filePath.lastIndexOf('.')).toLowerCase();
  const mime = MIME[ext] || 'application/octet-stream';
  const body = readFileSync(filePath);

  return new NextResponse(body, {
    headers: {
      'Content-Type': mime,
      'Content-Length': String(body.byteLength),
      // The library is static; browser + any CDN may hold it forever.
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}