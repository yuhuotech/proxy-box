<template>
  <aside class="pb-sidebar">
    <router-link to="/subs" class="pb-brand"><img src="/proxy-box.svg" alt="" /><span>ProxyBox<small>{{ labels.workspace }}</small></span></router-link>
    <div class="pb-nav-caption">{{ labels.resources }}</div>
    <nav :aria-label="labels.resources" class="pb-nav">
      <router-link to="/subs" :class="{ active: activeTab === 0 }"><nut-icon name="link" />{{ $t('tabBar.sub') }}</router-link>
      <router-link v-if="!shouldHideFilesTab" to="/files" :class="{ active: activeTab === 1 }"><nut-icon name="category" />{{ $t('tabBar.file') }}</router-link>
      <router-link v-if="!shouldHideSyncTab" to="/sync" :class="{ active: activeTab === 2 }"><nut-icon name="refresh2" />{{ $t('tabBar.sync') }}</router-link>
      <router-link v-if="shouldShowShareTab" to="/shares" :class="{ active: activeTab === 3 }"><font-awesome-icon icon="fa-solid fa-share-nodes" />{{ $t('tabBar.share') }}</router-link>
    </nav>
    <div class="pb-nav-caption">{{ labels.tools }}</div>
    <nav :aria-label="labels.tools" class="pb-nav">
      <router-link v-if="env?.feature?.archive" to="/archives"><font-awesome-icon icon="fa-solid fa-box-archive" />{{ $t('tabBar.archive') }}</router-link>
      <router-link to="/logs"><font-awesome-icon icon="fa-solid fa-file-lines" />{{ labels.logs }}</router-link>
      <router-link to="/my" :class="{ active: route.path.startsWith('/settings') || activeTab === 5 }"><nut-icon name="setting" />{{ $t('tabBar.my') }}<i v-if="env.hasNewVersion" class="pb-dot" /></router-link>
      <router-link to="/aboutUs"><font-awesome-icon icon="fa-solid fa-circle-info" />{{ labels.about }}</router-link>
    </nav>
    <div class="pb-sidebar-bottom"><div class="pb-status" :class="{ online: globalStore.fetchResult }"><i />{{ globalStore.fetchResult ? labels.connected : labels.disconnected }}</div><p>{{ labels.privacy }}</p><router-link to="/aboutUs">{{ labels.upstream }}</router-link></div>
  </aside>
</template>
<script lang="ts" setup>
import { useProxyBox } from '@/hooks/useProxyBox';
import { useGlobalStore } from '@/store/global';
import { useSettingsStore } from '@/store/settings';
import { useSystemStore } from "@/store/system";
import { SIDEBAR_EXPANDED_BREAKPOINT } from "@/store/system";
import { storeToRefs } from 'pinia';
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useWindowSize } from '@vueuse/core';

const { labels } = useProxyBox();
const route = useRoute();
const router = useRouter();
const routeList = ['/subs', '/files', '/sync', '/shares', '/archives', '/my'];
const activeTab = ref(routeList.indexOf(route.path));

watch(
  () => route.path,
  (newPath) => {
    let matchedIndex = routeList.indexOf(newPath);
    if (matchedIndex === -1) {
      if (newPath.includes('/files')) matchedIndex = 1;
      else if (newPath.includes('/subs') || newPath.includes('/collections')) matchedIndex = 0;
      else if (newPath.includes('/sync')) matchedIndex = 2;
      else if (newPath.includes('/shares')) matchedIndex = 3;
      else if (newPath.includes('/archives')) matchedIndex = 4;
      else if (newPath.includes('/my')) matchedIndex = 5;
    }
    activeTab.value = matchedIndex;
  },
  { immediate: true }
);

const { width: windowWidth } = useWindowSize();

const isExpanded = computed(() => {
  return windowWidth.value >= SIDEBAR_EXPANDED_BREAKPOINT;
});

const globalStore = useGlobalStore();
const settingsStore = useSettingsStore();
const systemStore = useSystemStore();

const { appearanceSetting, hasFetchedSettings, hasCachedAppearanceNavigationSetting } = storeToRefs(settingsStore);
const { env } = storeToRefs(globalStore);
const { navBarHeight } = storeToRefs(systemStore);
const shouldHideFilesTab = computed(() => {
  if (hasCachedAppearanceNavigationSetting.value) {
    return !!appearanceSetting.value.istabBar2;
  }

  if (!hasFetchedSettings.value) {
    return false;
  }

  return !!appearanceSetting.value.istabBar2;
});
const shouldHideSyncTab = computed(() => {
  if (hasCachedAppearanceNavigationSetting.value) {
    return !!appearanceSetting.value.istabBar;
  }

  if (!hasFetchedSettings.value) {
    return false;
  }

  return !!appearanceSetting.value.istabBar;
});
const shouldHideShareTab = computed(() => {
  if (hasCachedAppearanceNavigationSetting.value) {
    return !!appearanceSetting.value.istabBar3;
  }

  if (!hasFetchedSettings.value) {
    return false;
  }

  return !!appearanceSetting.value.istabBar3;
});
const shouldShowShareTab = computed(() => {
  return !!env.value?.feature?.share && !shouldHideShareTab.value;
});

</script>

