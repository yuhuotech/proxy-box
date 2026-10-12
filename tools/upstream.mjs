#!/usr/bin/env node
// ProxyBox upstream tracking and reviewable integration, 2026-10-11.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const baseline = JSON.parse(fs.readFileSync(path.join(root, 'upstream.json'), 'utf8'));
const [command = 'check', kind, revision] = process.argv.slice(2);
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim();
const trackingRef = name => `refs/remotes/upstream-${name}/${baseline[name].branch}`;
function fetchUpstream(name) {
  const item = baseline[name];
  // Fetch into dedicated refs without changing origin, branches or working files.
  git('fetch', '--no-tags', item.url, `+refs/heads/${item.branch}:${trackingRef(name)}`);
  git('cat-file', '-e', `${item.commit}^{commit}`);
  return git('rev-parse', trackingRef(name));
}
function assertCleanBranch() {
  if (git('status', '--porcelain')) throw new Error('工作区必须干净：先保存并提交改动，再在独立分支 prepare。');
  const branch = git('branch', '--show-current');
  if (!branch || ['master', 'main', 'release'].includes(branch)) throw new Error('请先创建 upstream/... 独立分支，不可直接修改主分支。');
}
function setBaseline(name, commit) {
  const location = name === 'backend' ? 'backend/package.json' : 'package.json';
  baseline[name].commit = commit;
  baseline[name].version = JSON.parse(git('show', `${commit}:${location}`)).version;
  fs.writeFileSync(path.join(root, 'upstream.json'), JSON.stringify(baseline, null, 2) + '\n');
}
try {
  if (command === 'check') {
    const report = { checkedAt: new Date().toISOString(), upstream: {} };
    for (const name of ['backend', 'frontend']) {
      const head = fetchUpstream(name);
      const item = baseline[name];
      const ancestor = (() => { try { git('merge-base', '--is-ancestor', item.commit, head); return true; } catch { return false; } })();
      report.upstream[name] = { baseline: item.commit, latest: head, updatesAvailable: head !== item.commit, linearHistory: ancestor,
        commits: git('log', '--format=%h %s', `${item.commit}..${head}`).split('\n').filter(Boolean) };
    }
    const text = JSON.stringify(report, null, 2) + '\n';
    process.stdout.write(text);
    if (process.env.UPSTREAM_REPORT_PATH) fs.writeFileSync(process.env.UPSTREAM_REPORT_PATH, text);
  } else if (command === 'prepare') {
    if (!['backend', 'frontend'].includes(kind)) throw new Error('使用 prepare backend|frontend [commit]。');
    assertCleanBranch();
    const latest = fetchUpstream(kind);
    const target = revision ? git('rev-parse', `${revision}^{commit}`) : latest;
    git('merge-base', '--is-ancestor', baseline[kind].commit, target);
    git('merge-base', '--is-ancestor', target, latest);
    if (target === baseline[kind].commit) { console.log('已经是所选上游版本。'); process.exit(0); }
    if (kind === 'backend') {
      // Common history is retained. Conflicts deliberately stop for human resolution.
      git('merge', '--no-commit', '--no-ff', target);
    } else {
      const excluded = baseline.frontend.excludedPaths.flatMap(p => ['--exclude', `frontend/${p}/**`, '--exclude', `frontend/${p}`]);
      const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'proxy-box-upstream-'));
      try {
        const patch = path.join(temp, 'upstream.patch');
        fs.writeFileSync(patch, execFileSync('git', ['diff', '--binary', '--full-index', baseline[kind].commit, target], { cwd: root, maxBuffer: 64 * 1024 * 1024 }));
        git('apply', '--3way', '--directory=frontend', ...excluded, patch);
      } finally { fs.rmSync(temp, { recursive: true, force: true }); }
    }
    setBaseline(kind, target);
    console.log(`已准备 ${kind} ${target}，未提交。复核全部差异、刷新许可证副本、运行回归后提交。`);
  } else if (command === 'record') {
    if (!['backend', 'frontend'].includes(kind) || !revision) throw new Error('解决冲突并完成验证后，使用 record backend|frontend <commit>。');
    const latest = fetchUpstream(kind);
    const target = git('rev-parse', `${revision}^{commit}`);
    git('merge-base', '--is-ancestor', baseline[kind].commit, target);
    git('merge-base', '--is-ancestor', target, latest);
    if (git('diff', '--name-only', '--diff-filter=U')) throw new Error('仍有未解决的冲突。');
    setBaseline(kind, target);
    console.log('已记录基线。请确认功能验证完成并将基线与同步修改一起提交。');
  } else throw new Error('命令：check | prepare backend|frontend [commit] | record backend|frontend <commit>');
} catch (error) { console.error(error.message); process.exitCode = 1; }
