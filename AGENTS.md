# ProxyBox 开发约定

ProxyBox（仓库/包名 `proxy-box`）fork 自 **SubStore / Sub-Store**。项目定位是：重构全部 UI，同时保留订阅管理能力，并定期与上游功能对齐。它不是 Sub-Store 官方版本。

## 来源与许可

- 后端：`https://github.com/sub-store-org/Sub-Store`，根目录 `LICENSE` 原文为 AGPL-3.0，必须保留。
- 前端：`https://github.com/sub-store-org/Sub-Store-Front-End`，引入 `frontend/`，原 GPL-3.0 许可证在 `frontend/LICENSE`，必须保留。
- 保留原作者、第三方版权、许可证及无担保声明；改名不改变这些义务。ProxyBox 修改说明及日期维护在 `NOTICE.md`、`docs/CHANGELOG.md`。
- 对外分发或提供网络服务时，必须提供**实际运行版本**对应源码（含修改、依赖声明、构建与运行脚本）。默认构建随前端打包 `/source/proxy-box-source.tar.gz`；发布前核实下载有效。组合的 AGPL/GPL 源码要求见 `docs/LICENSE-COMPLIANCE.md`。
- README 顶部、界面关于页及全局页脚保留 fork 来源、许可证、源码入口。不得把“跟踪上游”写成未经验证的完全同步。

## 品牌与文档

- 用户可见品牌用 **ProxyBox**，目录、仓库、包名用 **proxy-box**。
- README 用清晰的中文开源项目结构：来源、功能、预览、快速开始、开发、部署、同步、许可、贡献。
- 移除广告、推广、联盟营销和无关赞助展示；保留技术文档来源及作者贡献致谢。第三方依赖内部版权/许可证不能删除。
- `SUB_STORE_*` 环境变量、API 路径、数据键、导出结构、脚本接口、兼容构建文件名、模块 rewrite 域名保持上游兼容；不要全局替换 `sub-store`。

## UI 与功能

- 桌面侧栏、移动端导航；全页面、表单、编辑器、日志、弹框、预览、空态和错误态采用统一 UI 规范。
- 公共设计层：`frontend/src/assets/styles/proxy-box.scss`；导航在 `SideBar.vue` / `NavBar.vue`，说明及统计在 `WorkspaceHeading.vue`。
- 保留全部处理器、高级参数、排序、拖拽、导入导出、分享、归档、定时同步、主题及语言能力；功能根据后端 feature flags 展示。
- 异步操作立即显示 loading，并防重复提交。不可用假数据替代真实统计；禁止把订阅链接、密钥或后端私密地址写入公开截图。
- 验证桌面和移动端、明暗主题、错误和成功路径；测试只能使用隔离数据，不可覆盖真实用户配置。

## 上游维护

- `upstream.json` 记录两个上游的精确提交、版本和目录。`node tools/upstream.mjs check` 只读检查；`prepare backend|frontend` 在干净工作区与独立分支执行，保留冲突以供解决。
- 后端保留共同 Git 历史并 merge；前端用基于精确 baseline 的三方补丁合并。禁止整目录覆盖前端、自动选择 ours/theirs、自动强推、自动发版。
- 根 CI 每周检查两套上游并保存报告；检查不等于同步。同步完须更新 baseline、修改记录、功能清单、验证报告及许可证副本。
- 日常修改应集中在独立设计层，减少业务代码变更与未来冲突。上游新增页面和弹框必须补入 UI 及回归清单。

## 命令

使用 `.node-version` 指定 Node；包管理器 `pnpm@11.0.9`。

```bash
pnpm --dir backend install --frozen-lockfile
pnpm --dir frontend install --frozen-lockfile
pnpm --dir backend test
pnpm --dir backend bundle:esbuild
pnpm --dir frontend check:locales
pnpm --dir frontend build
node tools/upstream.mjs check
```

详细启动配置见 `docs/DEVELOPMENT.md`，发布流程见 `docs/UPSTREAM.md`。修改后汇报实际验证结果与尚未验证项，不把构建通过当成全部功能已验证。
