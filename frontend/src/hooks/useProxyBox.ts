import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
const zh = {
  workspace: '订阅管理工作台', resources: '资源管理', tools: '工作台', about: '关于与开源',
  connected: '后端已连接', disconnected: '后端未连接', upstream: '基于 Sub-Store · 保持上游对齐',
  source: '获取源码', license: '许可证', refresh: '刷新数据', add: '新建', back: '返回',
  search: '搜索', logs: '运行日志', subscriptions: '订阅', collections: '组合', files: '文件', tasks: '同步任务',
  privacy: '你的订阅，由你掌控。', overview: '工作台概览',
  subDesc: '收纳订阅、组合节点，轻松转换为你需要的格式。',
  fileDesc: '管理远程与本地文件，构建可复用的配置。',
  syncDesc: '让订阅与文件按计划生成、同步，保持最新。',
  shareDesc: '通过独立链接分享资源，精确控制访问与有效期。',
  archiveDesc: '保留历史快照，随时检查、恢复和下载。',
  myDesc: '管理存储、备份与个性化偏好。',
  logsDesc: '查看运行过程，定位问题与检查任务结果。',
  settingsDesc: '按你的使用习惯，配置这个工作台。',
  editDesc: '编辑资源与处理流程，预览后保存。',
  aboutDesc: '了解项目来源、开源许可证与当前版本。',
  forkNotice: 'ProxyBox fork 自 SubStore / Sub-Store，重构 UI，并定期跟踪上游功能更新。',
  legal: '保留原作者版权。软件不提供担保；你可以按相应许可证复制、修改与再分发。',
  frontend: '前端上游', backend: '后端上游', changes: '修改记录', copyright: '© Sub-Store 原作者 Peng-YM 及贡献者；ProxyBox 贡献者（修改部分）',
};
const en: typeof zh = {
  workspace: 'Subscription workspace', resources: 'RESOURCES', tools: 'WORKSPACE', about: 'About & open source',
  connected: 'Backend connected', disconnected: 'Backend disconnected', upstream: 'Built on Sub-Store · Tracking upstream',
  source: 'Source code', license: 'Licenses', refresh: 'Refresh data', add: 'Create', back: 'Back',
  search: 'Search', logs: 'Runtime logs', subscriptions: 'Subscriptions', collections: 'Collections', files: 'Files', tasks: 'Sync tasks',
  privacy: 'Your subscriptions. Your control.', overview: 'Workspace overview',
  subDesc: 'Organize subscriptions, combine nodes and convert to your preferred format.',
  fileDesc: 'Manage local and remote files. Build reusable configurations.',
  syncDesc: 'Generate and sync subscriptions and files on your schedule.',
  shareDesc: 'Share resources with precise access and expiration controls.',
  archiveDesc: 'Keep historical snapshots. Inspect, restore or download anytime.',
  myDesc: 'Manage storage, backups and personal preferences.',
  logsDesc: 'Inspect activity, investigate errors and review task results.',
  settingsDesc: 'Make this workspace work the way you do.',
  editDesc: 'Edit resources and processors, preview, then save.',
  aboutDesc: 'Project origins, open source licenses and running versions.',
  forkNotice: 'ProxyBox is a fork of SubStore / Sub-Store with a redesigned UI and regular upstream feature alignment.',
  legal: 'Original copyrights retained. No warranty. Copy, modify and redistribute under the respective licenses.',
  frontend: 'Frontend upstream', backend: 'Backend upstream', changes: 'Change history', copyright: '© Sub-Store author Peng-YM and contributors; ProxyBox contributors (modifications)',
};
export function useProxyBox() {
  const { locale } = useI18n();
  return { labels: computed(() => locale.value.startsWith('zh') ? zh : en) };
}
export const SOURCE_REPO = 'https://github.com/yuhuotech/proxy-box';
export const SOURCE_URL = import.meta.env.VITE_SOURCE_URL || '/source/proxy-box-source.tar.gz';
