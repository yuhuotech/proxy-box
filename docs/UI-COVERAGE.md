# UI 覆盖与回归

ProxyBox 纳入完整上游前端，再以公共设计系统和新导航重构 UI；所有原业务页面、处理器与 API 保留。下表是维护清单，新增上游界面须同时补齐。

## 页面

| 页面/路径 | 设计覆盖 |
| --- | --- |
| `/subs` | 资源概览、订阅/组合卡片、标签、排序、空态、错误态、搜索与新增 |
| `/files` | 文件与 mihomo 配置列表、标签、排序、导入、导出与预览 |
| `/sync` | 同步任务、Cron、批次操作、产物、来源选择与平台参数 |
| `/shares` | 分享列表、创建、编辑、有效期、访问次数、链接与批量操作 |
| `/archives` | 历史资源、分类、搜索、详情、下载、恢复及永久删除 |
| `/logs` | 日志筛选、搜索、刷新、选择与复制；日志浮层使用同一组件 |
| `/my` | Gist/手动存储、备份恢复、缓存与请求配置、语言及设置导航 |
| `/settings/more` | 外观、主题、展示、清除前后端数据 |
| `/settings/api` | 多后端管理、连接、删除、路径/地址设置 |
| `/aboutUs` | ProxyBox 来源、两套许可、无担保与当前版本源码入口 |
| `/edit/subs/:id`、`/edit/collections/:id` | 显示/内容/操作分组、输入、公共属性、处理器、保存与即时预览 |
| `/edit/files/:id` | 文件编辑器、mihomo 来源/覆写、脚本处理、保存与预览 |
| `/edit/sync/:id` | 来源、平台、上传、独立 Cron 等完整任务编辑 |
| `/edit/shares/:name` | 完整分享创建/编辑、来源、期限/访问次数、参数及加密 |
| `/preview` | 转换结果、只读代码编辑器、语言、搜索、复制与外部使用链接 |
| `/404` | 返回首页与错误说明 |

## 通用组件和弹框

- 基础组件：按钮、输入、表单、开关、选择、复选、单元格、分组、标签、提示、进度、拖拽卡片与底部操作栏。
- 操作确认：NutUI Dialog、Toast、确认删除/归档/恢复、保存验证失败、清除缓存/数据、备份同步提示。
- 后端连接：`MagicPathDialog` 与语言切换。
- 资源新增：订阅/组合、文件/mihomo 选择，以及导入弹框。
- 编辑器辅助：`DesktopPicker`、`ImageFitPicker`、`TagPopup`、`IconPopup`、`ParamsEditor`、编辑分组说明、公共属性说明、age 密钥助手。
- 处理器：正则、去重、脚本、协议/区域过滤、旗帜、节点排序、域名解析、属性设置、修改响应、从订阅添加节点；共享表单与编辑器样式。
- 预览及同步：`CompareTable`、`FilePreview`、`PreviewPanel`、`PreviewNodeNamesDialog`、`NodeInfoPanel`、`ArtifactPanel`。
- 分享：来源 Cascader、日期时间控件、参数、加密、链接操作及批量选择。
- 日志：整页与 `LogsOverlay`、关键字/正则、数量/刷新间隔、详情与批量复制。

公共设计样式包含 teleported 到 body 的弹框；桌面弹框居中，手机采用底部 sheet，日志与对比预览使用独立容器。原始主题选择与 feature gates 保留。

## 可重复浏览器回归

使用一次性测试数据目录启动**前后端合并服务**，显式声明这是隔离测试实例。工具会创建示例资源、修改测试设置、执行归档与恢复，不能对真实用户服务运行。

```bash
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
# 启动配置参照 DEVELOPMENT.md，数据目录换为一次性目录
PROXY_BOX_QA_BASE_URL=http://127.0.0.1:3000 \
PROXY_BOX_QA_DISPOSABLE=1 pnpm test:ui
```

默认输出 `artifacts/ui/`：JSON 验证报告与截图。可用 `PROXY_BOX_QA_BROWSER` 指定本机 Chrome 可执行文件，`PROXY_BOX_QA_OUTPUT` 更换输出目录。

回归覆盖桌面 1440×1000、手机 390×844 的路由、无横向溢出、无前端 runtime error，并操作保存、防重复提交、500 失败恢复、表单校验、创建弹框、节点预览、日志浮层、转换下载、分享访问、归档恢复、备份导出、对应源码和许可证下载、明暗主题、手机工具菜单与连接失败路径。

源码构建通过不等于已部署；外部 Gist、推送服务、代理 App 真机协议、远程订阅、多种客户端/浏览器及所有高级脚本组合需要相应环境进行验证。无需外部凭据的本地功能由现有后端测试和浏览器回归覆盖，不能宣称所有第三方服务已实际联调。

## 本次结果

具体结果记录于 [VALIDATION.md](VALIDATION.md)。README 截图来自隔离测试的示例数据。
