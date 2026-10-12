# ProxyBox Frontend

ProxyBox 的现代订阅工作台，fork 自 [Sub-Store Frontend](https://github.com/sub-store-org/Sub-Store-Front-End)，保留原 **GPL-3.0** 许可证。后端来自 AGPL-3.0 的 Sub-Store；两套原许可与作者声明分别保留。

前端包含上游完整功能，重构桌面侧栏、移动导航、工具栏、资源概览、明暗主题与通用组件。功能定期跟踪上游，精确基线见根 `upstream.json`；不是 Sub-Store 官方发行版。

```bash
pnpm install --frozen-lockfile
pnpm dev
pnpm check:locales
pnpm build
```

开发端口 `8888`，默认 `/backend` 代理到 `127.0.0.1:3000`。构建会附带许可证与对应源码包。

完整说明见 [项目 README](../README.md)、[开发与部署](../docs/DEVELOPMENT.md)、[上游同步](../docs/UPSTREAM.md)、[许可与来源](../NOTICE.md)。
