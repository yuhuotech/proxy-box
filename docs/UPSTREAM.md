# 与上游保持对齐

ProxyBox 跟踪后端 Sub-Store 和独立 Sub-Store Frontend；实际已引入提交见根 `upstream.json`。每周一 UTC 02:00 的 GitHub Actions 检查最新提交并保存报告，不自动合并或发布。fork 的 GitHub Actions 需在仓库启用后才会运行。

## 检查

```bash
node tools/upstream.mjs check
```

只更新本地 `refs/remotes/upstream-backend/` 与 `refs/remotes/upstream-frontend/` 并输出差异，不修改工作树、不切换 origin，不合并代码。报告记录两个精确提交、未引入提交和是否为线性历史。可设置 `UPSTREAM_REPORT_PATH` 保存 JSON。

## 引入后端

先提交本地修改并确保工作区干净：

```bash
git switch -c upstream/backend-YYYYMMDD
node tools/upstream.mjs prepare backend
```

利用 fork 保留的共同历史，执行 `git merge --no-commit --no-ff`。默认是最新上游，也可指定其历史中的固定提交。禁止直接在主分支运行。工具不会提交或发布；冲突会停止操作。

解决冲突时保留 ProxyBox 的文档、CI、来源说明、现代 UI 与源码发布约定，并引入上游业务修复。不能整批选择 ours/theirs。若 merge 中止可用 `git merge --abort`。冲突解决与验证完成后用下方 `record` 更新基线，然后完成 merge commit。

## 引入前端

```bash
git switch -c upstream/frontend-YYYYMMDD
node tools/upstream.mjs prepare frontend
```

工具获取精确上游基线对象，对 `baseline..target` 生成 binary/full-index 补丁，再以 `git apply --3way --directory=frontend` 引入；这样可根据原文件内容同时保留 ProxyBox 定制，不用整目录覆盖。上游仓库自有 `.github`、`.husky`、`.vscode` 不导入，根仓库负责 CI。

如有冲突，工具不会更新基线；检查 `git status`，解决冲突后 `git add`，再验证和记录目标提交。前端三方补丁失败没有 `merge --abort`：在该专用干净分支上逐文件恢复本次变更，或保存需要的内容后丢弃该专用分支，重新开始；不要对用户有其他修改的分支做 reset。

```bash
node tools/upstream.mjs record frontend <已合并目标提交>
# 后端冲突同理：record backend <目标提交>
```

`record` 只检查提交血缘和未解决冲突，不证明功能兼容。只在修改已合并且验证完成时使用。

## 合并后的验收

1. 阅读上游 release notes 与实际 diff；更新 UI 覆盖清单，检查新 API、feature flags、处理器、字段与参数。
2. 保留 `SUB_STORE_*`、API 路径、持久化键和构建文件名契约；不要因品牌改名破坏协议。
3. 同步许可副本：根 `LICENSE` → `frontend/public/licenses/AGPL-3.0.txt`，`frontend/LICENSE` → `frontend/public/licenses/GPL-3.0.txt`，保留第三方声明。
4. 运行后端测试、前端 locale 校验和构建。真实浏览器验证订阅/组合/文件编辑、转换预览、同步、分享、归档、日志、备份恢复、设置和弹框，覆盖桌面、移动、明暗、失败/成功路径。
5. 更新 `upstream.json`、`docs/CHANGELOG.md` 和验证记录；审核差异，再合并维护分支。
6. 发布时绑定实际 commit，生成对应源码包，验证部署下载链接。CI 检查和构建产物不等于已经部署。

首次前端引入完整 GPL 源码；后续维护尽量把视觉改动放在独立设计层，降低冲突。上游版本字符串保留，以兼容现有 semver 判断；ProxyBox 的发布另按自己的 Git 标签标识，不复用上游自动强推 release 分支逻辑。
