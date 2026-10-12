// Run only against a disposable local ProxyBox server; never a user's configured backend.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.PROXY_BOX_QA_BASE_URL;
if (!base || process.env.PROXY_BOX_QA_DISPOSABLE !== '1' || !['localhost', '127.0.0.1'].includes(new URL(base).hostname)) {
  throw new Error('Set PROXY_BOX_QA_DISPOSABLE=1 and PROXY_BOX_QA_BASE_URL to an isolated local merged server. This test writes sample data.');
}
(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.PROXY_BOX_QA_BROWSER ? { executablePath: process.env.PROXY_BOX_QA_BROWSER } : {}) });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'zh-CN' });
  const page = await context.newPage();
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  const output = path.resolve(process.env.PROXY_BOX_QA_OUTPUT || 'artifacts/ui'); fs.mkdirSync(output, { recursive: true });
  const suffix = Date.now(); const sub = `PB-QA-${suffix}`; const file = `PB-QA-file-${suffix}`; const collection = `PB-QA-collection-${suffix}`; const artifact = `PB-QA-sync-${suffix}`;
  async function api(method, endpoint, data) {
    const res = await context.request.fetch(base + '/backend' + endpoint, { method, data });
    const body = await res.json(); assert.equal(body.status, 'success', `${method} ${endpoint}: ${JSON.stringify(body)}`); return body.data;
  }
  const enc = encodeURIComponent;
  await api('PATCH', '/api/settings', { logsMaxCount: '100', appearanceSetting: { isSimpleMode: false, isIconColor: true, listPageViewMode: 'dual-column', editorGroupingMode: 'edit-only' } });
  await api('POST', '/api/subs', { name: sub, 'display-name': '我的示例订阅', source: 'local', content: 'trojan://demo@example.com:443#香港节点\ntrojan://demo@example.net:443#东京节点', process: [], tag: ['个人'], subUserinfo: 'upload=0; download=1073741824; total=107374182400; expire=1893456000' });
  await api('POST', '/api/collections', { name: collection, 'display-name': '出行组合', subscriptions: [sub], process: [], tag: ['工作'] });
  await api('POST', '/api/files', { name: file, 'display-name': '配置文件', source: 'local', content: 'mode: rule\nlog-level: info\n', process: [], tag: ['配置'] });
  await api('POST', '/api/artifacts', { name: artifact, 'display-name': '每日订阅更新', type: 'subscription', source: sub, platform: 'ClashMeta', upload: false });
  const share = await api('POST', '/api/token', { payload: { type: 'sub', name: sub, 'display-name': '出行分享' }, options: { expiresIn: '1d', expirationMode: 'duration', expiresValue: 1, expiresUnit: 'day' } });
  const archived = `PB-QA-archived-${suffix}`;
  await api('POST', '/api/files', { name: archived, source: 'local', content: 'archived: true', process: [] });
  await api('DELETE', `/api/file/${enc(archived)}?mode=archive`);
  const archives = await api('GET', '/api/archives'); assert.ok(archives.length > 0);
  const routes = ['/subs','/files','/sync','/shares','/archives','/logs','/my','/settings/more','/settings/api','/aboutUs','/edit/subs/UNTITLED','/edit/collections/UNTITLED','/edit/files/UNTITLED','/edit/files/UNTITLED-mihomoConfig','/edit/sync/UNTITLED',`/edit/subs/${enc(sub)}`,`/edit/files/${enc(file)}`,`/edit/shares/${enc(sub)}?type=sub&token=${share.token}`, '/edit/shares/UNTITLED', `/preview?url=${enc(base + '/backend/download/' + enc(sub) + '?target=ClashMeta')}&name=Demo&sourceType=sub&sourceName=${enc(sub)}`, '/404'];
  async function go(route) { await page.goto(base + route); await page.waitForTimeout(500); }
  const views = [];
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    for (const route of routes) {
      await go(route); await page.locator('.pb-toolbar').waitFor();
      assert.ok((await page.title()).endsWith('ProxyBox'));
      assert.ok(await page.locator('.pb-legal-footer').isVisible());
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Overflow: ${viewport.width} ${route}`);
      views.push({ width: viewport.width, route });
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await go(`/edit/subs/${enc(sub)}`);
  await page.locator('.compare-btn').click();
  await page.locator('.compare-page-wrapper').waitFor();
  assert.ok((await page.locator('.compare-page-wrapper').innerText()).includes('香港节点'));
  await page.waitForTimeout(250); await page.screenshot({ path: path.join(output, 'preview.png') });
  await go(`/edit/subs/${enc(sub)}`);
  // Delay the response to observe immediate lock and prevent a rapid second click.
  let saveCount = 0;
  const savePattern = '**/backend/api/sub/' + enc(sub);
  await page.route(savePattern, async route => {
    if (route.request().method() === 'PATCH') { saveCount++; await new Promise(resolve => setTimeout(resolve, 300)); }
    await route.continue();
  });
  await page.getByPlaceholder('输入展示的名称').fill('我的示例订阅');
  await page.locator('.submit-btn').evaluate(button => { button.click(); button.click(); });
  await page.waitForURL('**/subs'); assert.equal(saveCount, 1, 'Save must not submit twice');
  await page.unroute(savePattern);
  await go(`/edit/subs/${enc(sub)}`);
  await page.route(savePattern, async route => {
    if (route.request().method() === 'PATCH') await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ status: 'failed', error: { message: 'QA failure', code: 'QA_FAILURE' } }) });
    else await route.continue();
  });
  await page.locator('.submit-btn').click(); await page.waitForTimeout(600);
  assert.equal(await page.locator('.submit-btn').isDisabled(), false, 'Failed save must release lock');
  assert.ok(page.url().includes('/edit/subs/')); await page.unroute(savePattern);
  await page.locator('.submit-btn').click(); await page.waitForURL('**/subs');
  await go('/edit/subs/UNTITLED'); await page.locator('.submit-btn').click(); await page.locator('.nut-dialog:visible').waitFor();
  await page.screenshot({ path: path.join(output, 'validation.png') });
  await go('/subs'); await page.getByRole('button', { name: '新建', exact: true }).click(); await page.locator('.add-sub-popup:visible').waitFor();
  await page.waitForTimeout(300); await page.screenshot({ path: path.join(output, 'create.png') });
  await go('/subs'); await page.getByRole('button', { name: '运行日志', exact: true }).click();
  await page.locator('.logs-overlay-panel').waitFor(); await page.locator('.logs-overlay-panel .logs-controls').waitFor();
  await page.waitForTimeout(300); await page.screenshot({ path: path.join(output, 'logs.png') });
  await page.locator('.logs-overlay-panel .pb-panel-header button').click();
  // API conversion, share access, archive restoration and backup use the same isolated fixture.
  const converted = await context.request.get(base + `/backend/download/${enc(sub)}?target=ClashMeta`);
  assert.equal(converted.status(), 200); assert.ok((await converted.text()).includes('example.com'));
  const shared = await context.request.get(base + `/share/sub/${enc(sub)}?token=${share.token}&target=ClashMeta`);
  assert.equal(shared.status(), 200); assert.ok((await shared.text()).includes('example.com'));
  await api('POST', `/api/archives/${archives.find(a => a.name === archived || a.item?.name === archived)?.id || archives[0].id}/restore`, {});
  const backup = await context.request.get(base + '/backend/api/storage'); assert.equal(backup.status(), 200); assert.ok((await backup.text()).includes(sub));
  const source = await context.request.get(base + '/source/proxy-box-source.tar.gz'); assert.equal(source.status(), 200); assert.ok((await source.body()).length > 1000);
  for (const license of ['AGPL-3.0', 'GPL-3.0']) { const res = await context.request.get(base + `/licenses/${license}.txt`); assert.equal(res.status(), 200); assert.ok((await res.text()).includes('GENERAL PUBLIC LICENSE')); }
  for (const scheme of ['light', 'dark']) {
    await page.emulateMedia({ colorScheme: scheme });
    await go('/subs'); await page.waitForTimeout(3000); await page.screenshot({ path: path.join(output, `workspace-${scheme}.png`) });
    await go('/aboutUs'); await page.waitForTimeout(3000); await page.screenshot({ path: path.join(output, `about-${scheme}.png`) });
  }
  await page.setViewportSize({ width: 390, height: 844 }); await page.emulateMedia({ colorScheme: 'light' }); await go('/subs'); await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(output, 'workspace-mobile.png') });
  await page.locator('.pb-mobile-tools summary').click(); assert.ok(await page.locator('.pb-mobile-tools > div').isVisible());
  // Connection failure is intentional and must expose a recoverable setup dialog.
  await page.route('**/backend/api/utils/env*', r => r.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ status: 'failed', error: { message: 'QA offline' } }) }));
  await go('/subs'); await page.locator('.magic-path-popup:visible').waitFor();
  await page.screenshot({ path: path.join(output, 'connection-failure.png') });
  assert.deepEqual(errors, []);
  fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify({ checkedAt: new Date().toISOString(), views, checks: ['preview', 'save', 'duplicate-save-lock', 'save-error-recovery', 'validation', 'create-dialog', 'logs-overlay', 'conversion', 'share-access', 'archive-restore', 'backup', 'source-download', 'licenses', 'light-dark', 'mobile-tools', 'connection-failure'], runtimeErrors: errors }, null, 2));
  console.log(`UI QA passed: ${views.length} page/viewport combinations plus operation checks.`);
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });
