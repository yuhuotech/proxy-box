import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const run = (cwd, command, args) => execFileSync(command, args, { cwd, encoding: 'utf8', stdio: ['ignore','pipe','pipe'] }).trim();
const git = (cwd, ...args) => run(cwd, 'git', args);
const write = (root, name, text) => { fs.mkdirSync(path.dirname(path.join(root,name)), { recursive: true }); fs.writeFileSync(path.join(root,name),text); };
const commit = root => { git(root,'add','.'); git(root,'commit','-m','fixture'); return git(root,'rev-parse','HEAD'); };
function repo(root) { fs.mkdirSync(root, {recursive:true}); git(root,'init','-b','master'); git(root,'config','user.name','QA'); git(root,'config','user.email','qa@example.invalid'); }
function fixture() {
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'proxy-box-tools-')); const backend=path.join(temp,'backend-upstream'); const frontend=path.join(temp,'frontend-upstream');const fork=path.join(temp,'fork');
 repo(backend); write(backend,'backend/package.json','{"version":"1.0.0"}');write(backend,'backend/engine.js','export const version = 1;\n');const be=commit(backend);
 repo(frontend);write(frontend,'package.json','{"version":"1.0.0"}');write(frontend,'src/widget.js','// upstream widget\nexport const label = "original";\nexport const behavior = 1;\n');write(frontend,'.github/workflows/upstream.yml','upstream: true\n');write(frontend,'LICENSE','GPL fixture\n');const fe=commit(frontend);
 git(temp,'clone',backend,fork);git(fork,'config','user.name','QA');git(fork,'config','user.email','qa@example.invalid');
 write(fork,'frontend/package.json','{"version":"1.0.0"}');write(fork,'frontend/src/widget.js','// upstream widget\nexport const label = "original";\nexport const behavior = 1;\n');write(fork,'frontend/LICENSE','GPL fixture\n');write(fork,'LICENSE','AGPL fixture\n');write(fork,'tools/upstream.mjs',fs.readFileSync(path.join(here,'upstream.mjs')));write(fork,'tools/package-source.mjs',fs.readFileSync(path.join(here,'package-source.mjs')));
 write(fork,'upstream.json',JSON.stringify({backend:{url:backend,branch:'master',commit:be,directory:'.'},frontend:{url:frontend,branch:'master',commit:fe,directory:'frontend',excludedPaths:['.github','.husky','.vscode']}}));
 write(fork,'.gitignore','node_modules/\nfrontend/dist/\nfrontend/public/source/\n.env.local\n');commit(fork);git(fork,'switch','-c','upstream/qa');
 return {temp,backend,frontend,fork,be,fe};
}
test('frontend three-way integration preserves fork design and excludes upstream workflows',()=>{
 const f=fixture();try {
  write(f.fork,'frontend/src/widget.js','// ProxyBox design\nexport const label = "original";\nexport const behavior = 1;\n');commit(f.fork);
  write(f.frontend,'src/widget.js','// upstream widget\nexport const label = "original";\nexport const behavior = 2;\n');write(f.frontend,'.github/workflows/upstream.yml','upstream: changed\n');const head=commit(f.frontend);
  const report=JSON.parse(run(f.fork,process.execPath,['tools/upstream.mjs','check']));assert.equal(report.upstream.frontend.latest,head);assert.equal(git(f.fork,'status','--porcelain'),'');
  run(f.fork,process.execPath,['tools/upstream.mjs','prepare','frontend']);const widget=fs.readFileSync(path.join(f.fork,'frontend/src/widget.js'),'utf8');assert.match(widget,/ProxyBox design/);assert.match(widget,/behavior = 2/);assert.equal(fs.existsSync(path.join(f.fork,'frontend/.github')),false);assert.equal(JSON.parse(fs.readFileSync(path.join(f.fork,'upstream.json'))).frontend.commit,head);
 }finally{fs.rmSync(f.temp,{recursive:true,force:true});}
});
test('backend integration preserves unrelated fork files without committing',()=>{
 const f=fixture();try {
  write(f.fork,'branding.txt','ProxyBox\n');commit(f.fork);const before=git(f.fork,'rev-parse','HEAD');write(f.backend,'backend/engine.js','export const version = 2;\n');const head=commit(f.backend);
  run(f.fork,process.execPath,['tools/upstream.mjs','prepare','backend']);assert.equal(git(f.fork,'rev-parse','HEAD'),before);assert.match(fs.readFileSync(path.join(f.fork,'backend/engine.js'),'utf8'),/version = 2/);assert.equal(fs.readFileSync(path.join(f.fork,'branding.txt'),'utf8'),'ProxyBox\n');assert.equal(JSON.parse(fs.readFileSync(path.join(f.fork,'upstream.json'))).backend.commit,head);
 }finally{fs.rmSync(f.temp,{recursive:true,force:true});}
});
test('dirty working trees and main branches reject integration',()=>{
 const f=fixture();try {
  write(f.fork,'dirty.txt','keep me');assert.throws(()=>run(f.fork,process.execPath,['tools/upstream.mjs','prepare','frontend']),/工作区必须干净/);assert.equal(fs.readFileSync(path.join(f.fork,'dirty.txt'),'utf8'),'keep me');fs.unlinkSync(path.join(f.fork,'dirty.txt'));git(f.fork,'switch','master');assert.throws(()=>run(f.fork,process.execPath,['tools/upstream.mjs','prepare','backend']),/独立分支/);
 }finally{fs.rmSync(f.temp,{recursive:true,force:true});}
});
test('source archive retains licenses, excludes local secrets and can rebuild without Git',()=>{
 const f=fixture();try {
  write(f.fork,'.env.local','SECRET=must-not-ship');write(f.fork,'frontend/dist/output.js','generated');run(f.fork,process.execPath,['tools/package-source.mjs']);const archive=path.join(f.fork,'frontend/dist/source/proxy-box-source.tar.gz');const files=run(f.fork,'tar',['-tzf',archive]);assert.match(files,/frontend\/LICENSE/);assert.match(files,/SOURCE-METADATA.json/);assert.doesNotMatch(files,/\.env.local|output.js|node_modules/);
  const unpack=path.join(f.temp,'unpacked');fs.mkdirSync(unpack);run(unpack,'tar',['-xzf',archive]);run(unpack,process.execPath,['tools/package-source.mjs']);assert.ok(fs.existsSync(path.join(unpack,'frontend/dist/source/proxy-box-source.tar.gz')));
 }finally{fs.rmSync(f.temp,{recursive:true,force:true});}
});
