// Serve verbatim license and modification notices with every frontend build.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const licenses = path.join(root, 'frontend/public/licenses'); fs.mkdirSync(licenses, { recursive: true });
for (const [from, to] of [['LICENSE','AGPL-3.0.txt'],['frontend/LICENSE','GPL-3.0.txt'],['NOTICE.md','NOTICE.txt']]) {
  fs.copyFileSync(path.join(root,from),path.join(licenses,to));
}
