<template>
  <section class="pb-page-heading">
    <div class="pb-heading-main"><div><p class="pb-eyebrow">{{ labels.overview }}</p><h1>{{ title }}</h1><p class="pb-page-description">{{ description }}</p></div><span class="pb-connection" :class="{ online: globalStore.fetchResult }"><i />{{ globalStore.fetchResult ? labels.connected : labels.disconnected }}</span></div>
    <div v-if="route.path === '/subs'" class="pb-stats">
      <div><span class="pb-stat-icon"><nut-icon name="link" /></span><span>{{ labels.subscriptions }}<strong>{{ subsStore.subs.length }}</strong></span></div>
      <div><span class="pb-stat-icon"><font-awesome-icon icon="fa-solid fa-layer-group" /></span><span>{{ labels.collections }}<strong>{{ subsStore.collections.length }}</strong></span></div>
      <div><span class="pb-stat-icon"><nut-icon name="category" /></span><span>{{ labels.files }}<strong>{{ subsStore.files.length }}</strong></span></div>
      <div><span class="pb-stat-icon"><nut-icon name="refresh2" /></span><span>{{ labels.tasks }}<strong>{{ artifactsStore.artifacts.length }}</strong></span></div>
    </div>
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useProxyBox } from '@/hooks/useProxyBox';
import { useSubsStore } from '@/store/subs';
import { useArtifactsStore } from '@/store/artifacts';
import { useGlobalStore } from '@/store/global';
const route = useRoute(); const { t } = useI18n(); const { labels } = useProxyBox();
const subsStore = useSubsStore(); const artifactsStore = useArtifactsStore(); const globalStore = useGlobalStore();
const title = computed(() => t(`navBar.pagesTitle.${route.meta.title}`));
const description = computed(() => {
  const descriptions = { '/subs': labels.value.subDesc, '/files': labels.value.fileDesc, '/sync': labels.value.syncDesc, '/shares': labels.value.shareDesc, '/archives': labels.value.archiveDesc, '/my': labels.value.myDesc, '/logs': labels.value.logsDesc, '/aboutUs': labels.value.aboutDesc };
  return descriptions[route.path] || (route.path.startsWith('/edit') ? labels.value.editDesc : labels.value.settingsDesc);
});
</script>
