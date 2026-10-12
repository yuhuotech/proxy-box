# ProxyBox 来源与修改声明

ProxyBox fork 自 SubStore / **Sub-Store**，不是 Sub-Store 官方发行版，也不表示上游作者背书。

| 来源 | 引入位置 | 原始许可 | 基线 |
| --- | --- | --- | --- |
| [Sub-Store](https://github.com/sub-store-org/Sub-Store) | `backend/`、`config/`、原始脚本及历史 | AGPL-3.0，见根 `LICENSE` | `a3e61061e50b40e5c5938969aab915d05d8d7069` |
| [Sub-Store Frontend](https://github.com/sub-store-org/Sub-Store-Front-End) | `frontend/` | GPL-3.0，见 `frontend/LICENSE` | `4bd7b0acbe65466b933ccea14fc61dbebe036ead` |

版权属于各原作者与贡献者。后端原作者标注为 Peng-YM；前端及其主题的作者署名保留在原代码中。ProxyBox 贡献者只对其新增或修改部分主张相应权利，不替代或移除原作者版权。

## 修改说明 · 2026-10-11

- 项目品牌改为 ProxyBox，包名与仓库名采用 `proxy-box`。
- 纳入独立前端源码；重构导航、工作台、明暗配色、通用组件及弹框；保留上游业务接口与功能。
- 整理 README、开发与部署文档、贡献约定及开源声明，移除项目宣传广告。
- 添加双上游版本追踪、更新检查、合并工具与验证流程。

后端及其修改继续按 AGPL-3.0 提供；前端及其修改继续按 GPL-3.0 提供。一起发布/运行时遵守 AGPL 第 13 条及各部分的原许可条件，提供组合所需对应源码。源码包包含两套许可证。

软件不提供担保；你可以按照适用许可证复制、修改与再分发。全文见 [LICENSE](LICENSE) 和 [frontend/LICENSE](frontend/LICENSE)。第三方依赖、编辑器和资源仍受其各自许可证约束，不因改名而改变。

感谢 Sub-Store 与 Sub-Store Frontend 全体贡献者，以及原项目致谢的 KOP-XIAO、Orz-3、58xinian。保留 `frontend/src/views/editCode/` 中第三方包的版权及许可证；致谢不表示拥有其商标或资源版权。
