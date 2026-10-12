// Package the corresponding source of this build. Also works in an extracted source archive.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { gzipSync } from 'node:zlib';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.resolve(root, process.argv[2] || 'frontend/dist');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'proxy-box-source-'));
const ignored = p => p === '.env' || p === 'backend/.env' || /(^|\/)(\.DS_Store|[^/]*\.log)$/.test(p) || /(^|\/)(node_modules|\.git|dist|dist-ssr|artifacts)(\/|$)/.test(p) || /^frontend\/public\/source(\/|$)/.test(p) || /(^|\/)(root(_.*)?|sub-store(_.*)?)\.json$/.test(p) || /(^|\/)\.env(?:\..*)?\.local$/.test(p) || p === 'backend/sub-store.min.js' || p === 'SOURCE-METADATA.json';
function walk(directory = '') {
  return fs.readdirSync(path.join(root, directory), { withFileTypes: true }).flatMap(entry => {
    const p = path.posix.join(directory, entry.name);
    if (ignored(p) || entry.isSymbolicLink()) return [];
    return entry.isDirectory() ? walk(p) : [p];
  });
}
try {
  let paths, commit, modified;
  try {
    const gitRoot = execFileSync('git', ['rev-parse', '--show-toplevel'], { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    if (path.resolve(gitRoot) !== root) throw new Error('Extracted source belongs to a different Git worktree');
    paths = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }).toString().split('\0');
    commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root }).toString().trim();
    modified = !!execFileSync('git', ['status', '--porcelain'], { cwd: root }).toString().trim();
  } catch {
    paths = walk();
    const inherited = fs.existsSync(path.join(root, 'SOURCE-METADATA.json')) ? JSON.parse(fs.readFileSync(path.join(root, 'SOURCE-METADATA.json'))) : {};
    commit = inherited.commit || 'source-archive'; modified = inherited.modified ?? true;
  }
  paths = paths.filter(p => p && !ignored(p) && fs.existsSync(path.join(root, p)) && fs.statSync(path.join(root, p)).isFile());
  if (!paths.includes('LICENSE') || !paths.includes('frontend/LICENSE')) throw new Error('Both original licenses are required.');
  const metadata = { project: 'ProxyBox', builtAt: new Date().toISOString(), commit, modified, upstream: JSON.parse(fs.readFileSync(path.join(root, 'upstream.json'))) };
  fs.writeFileSync(path.join(temp, 'SOURCE-METADATA.json'), JSON.stringify(metadata, null, 2) + '\n');
  const list = path.join(temp, 'files'); fs.writeFileSync(list, paths.join('\0') + '\0');
  const source = path.join(output, 'source'); fs.mkdirSync(source, { recursive: true });
  const archive = path.join(temp, 'source.tar');
  execFileSync('tar', ['-cf', archive, '-C', root, '--null', '-T', list]);
  execFileSync('tar', ['-rf', archive, '-C', temp, 'SOURCE-METADATA.json']);
  fs.writeFileSync(path.join(source, 'proxy-box-source.tar.gz'), gzipSync(fs.readFileSync(archive)));
  fs.writeFileSync(path.join(source, 'build.json'), JSON.stringify(metadata, null, 2) + '\n');
  console.log(`Corresponding source: ${source}/proxy-box-source.tar.gz (${paths.length} files)`);
} finally { fs.rmSync(temp, { recursive: true, force: true }); }
