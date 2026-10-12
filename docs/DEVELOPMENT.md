# 开发与部署

## 环境

使用 `.node-version` 指定的 Node.js，以及 `pnpm@11.0.9`。不要绕过锁文件升级依赖。

```bash
corepack enable
pnpm --dir backend install --frozen-lockfile
pnpm --dir frontend install --frozen-lockfile
```

## 本地开发

终端一（后端，保留上游配置命名）：

```bash
cd backend
SUB_STORE_BACKEND_API_HOST=127.0.0.1 SUB_STORE_BACKEND_API_PORT=3000 \
SUB_STORE_CORS_ALLOWED_ORIGINS=http://localhost:8888,http://127.0.0.1:8888 \
SUB_STORE_FRONTEND_BACKEND_PATH=/ pnpm esbuild:dev
```

终端二：

```bash
pnpm --dir frontend dev
```

访问 `http://localhost:8888`。前端 `/backend` 通过 Vite 代理到 `127.0.0.1:3000`。上游对写请求也检查 Origin，即使使用同源代理仍需把前端 origin 加入后端允许列表；连接远程后端可使用界面“后端设置”或 `?api=` 参数，浏览器直连时须配置精确 CORS origin。前端默认不再请求公网 `sub.store` 域名。

现有浏览器 `hostAPI` 配置及上游数据键保留，迁移用户的已选后端优先于默认值。前端及后端同步后的功能由 backend feature flags 决定，不支持的功能不强制显示。

## 测试与构建

```bash
pnpm --dir backend test
pnpm --dir backend bundle:esbuild
pnpm --dir frontend check:locales
pnpm --dir frontend build
```

后端仍输出 `backend/sub-store.min.js` 与兼容 App 的产物，保留上游脚本引用契约；产品名称为 ProxyBox。前端构建产物位于 `frontend/dist/`，包含 PWA、许可证和当前对应源码包。

## Node 单端口部署

先执行上面的构建，在仓库根目录运行：

```bash
SUB_STORE_BACKEND_API_HOST=127.0.0.1 \
SUB_STORE_BACKEND_API_PORT=3000 \
SUB_STORE_BACKEND_MERGE=true \
SUB_STORE_CORS_ALLOWED_ORIGINS=http://127.0.0.1:3000 \
SUB_STORE_FRONTEND_BACKEND_PATH=/backend \
SUB_STORE_FRONTEND_PATH="$PWD/frontend/dist" \
node backend/sub-store.min.js
```

访问 `http://127.0.0.1:3000`。API 在 `/backend/api/`，资源下载在对应的 `/backend/download/`；完整前端与分享路由由现有后端处理。用 `SUB_STORE_DATA_BASE_PATH=/你的持久化目录` 指定存储位置；该目录应预先创建。数据目录默认是运行工作目录，部署时使用专用目录和持久化卷，不要与构建源码混用。可在该目录运行 Node，并将前端与脚本路径改为绝对路径。

外网部署时以 TLS 反向代理到本机服务，将 `SUB_STORE_CORS_ALLOWED_ORIGINS` 改为实际 HTTPS 站点 origin（例如 `https://proxy.example.com`），使用上游后端路径/鉴权配置并限制管理入口；明确区分公开分享路径与管理 API。**`/backend` 是开发示例路径，不是鉴权机制。** 许可证和源码路径应对使用该服务的用户可访问。

验证 `/source/proxy-box-source.tar.gz` 能下载且对应本次构建，以及 `/licenses/AGPL-3.0.txt`、`/licenses/GPL-3.0.txt` 能查看。独立前后端部署时，反向代理 `/backend` 到后端并保留路径重写。

## App 模块

`config/` 中 Surge、Loon、QX、Stash、Shadowrocket、Egern 的协议、域名和脚本路径保留上游兼容。模块中的上游 URL 仍安装上游版本，不会安装 ProxyBox；详见 [配置说明](../config/README.md)。尚未发布 ProxyBox App 产物时不能把上游下载链接标成 ProxyBox。

## 设计维护

全局 UI 设计层位于 `frontend/src/assets/styles/proxy-box.scss`；导航、工作台头部与关于页在独立组件中。现有编辑器、处理器、操作历史、日志、分享、归档和数据接口继续使用上游实现。更换组件时须逐项检查 `docs/UI-COVERAGE.md`，新增功能也须加入。

## 品牌图标

原始标志为 `assets/proxy-box.svg`，浏览器 favicon、PWA 各尺寸与应用内默认图标由同一来源生成：

```bash
pnpm install --frozen-lockfile
pnpm icons
```

品牌修改后重新生成并构建；不要替换第三方客户端的商标或用户自定义图标。
