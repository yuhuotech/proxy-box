<template>
  <div v-if="isPWA" class="pwa_top_padding" />
  <header class="pb-toolbar nav-bar-wrapper" :class="{ 'is-logs-overlay-open': isLogsOverlayOpen }">
    <div class="pb-toolbar-leading">
      <button v-if="isNeedBack || isLogsOverlayOpen" class="pb-icon-button" :aria-label="labels.back" @click="back"><font-awesome-icon icon="fa-solid fa-arrow-left" /></button>
      <router-link v-else to="/subs" class="pb-mobile-brand"><img src="/proxy-box.svg" alt="ProxyBox" /></router-link>
      <span class="pb-breadcrumb">ProxyBox <span>/</span> <strong>{{ currentTitle || labels.search }}</strong></span>
      <button v-if="currentTitleWhetherAsk" class="pb-icon-button" :aria-label="t('navBar.pagesTitle.askWhat.sync.title')" @click="onClickNavbarIcon"><nut-icon name="ask" /></button>
    </div>
    <div v-if="!isLogsOverlayOpen" class="pb-toolbar-actions">
      <div v-if="isListSearchActive" class="pb-search">
        <input ref="searchInputRef" v-model="listSearchQuery" type="search" :placeholder="t('navBar.listSearch.placeholder')" :aria-label="labels.search" @keydown.esc.stop.prevent="closeListSearch" />
        <button class="pb-icon-button" :aria-label="t('navBar.listSearch.close')" @click="handleSearchCloseButton"><font-awesome-icon icon="fa-solid fa-circle-xmark" /></button>
      </div>
      <button v-else-if="showSearchButton" class="pb-icon-button" :class="{ 'is-active': listSearchStore.hasQuery }" :title="labels.search" :aria-label="labels.search" @click="openListSearch"><font-awesome-icon icon="fa-solid fa-magnifying-glass" /></button>
      <button v-if="showRefreshButton" class="pb-icon-button" :title="labels.refresh" :aria-label="labels.refresh" @click="refresh"><font-awesome-icon icon="fa-solid fa-arrow-rotate-right" /></button>
      <button class="pb-icon-button pb-secondary-action" :aria-label="simpleModeToggleTitle" :title="simpleModeToggleTitle" @click="setSimpleMode(!appearanceSetting.isSimpleMode)"><font-awesome-icon :icon="appearanceSetting.isSimpleMode ? 'fa-solid fa-toggle-on' : 'fa-solid fa-toggle-off'" /></button>
      <button v-if="showWideScreenNarrowModeToggle" class="pb-icon-button pb-secondary-action" :aria-label="wideScreenNarrowModeToggleTitle" :title="wideScreenNarrowModeToggleTitle" @click="handleWideScreenNarrowModeToggle"><font-awesome-icon :icon="isWideScreenNarrowModeActive ? 'fa-solid fa-mobile-screen-button' : 'fa-solid fa-desktop'" /></button>
      <button v-if="showListViewToggle" class="pb-icon-button pb-secondary-action" :disabled="isListViewModeLocked" :aria-label="listViewModeToggleTitle" :title="listViewModeToggleTitle" @click="handleListViewModeToggle"><font-awesome-icon :icon="effectiveListViewMode === 'dual-column' ? 'fa-solid fa-table-columns' : 'fa-solid fa-list'" /></button>
      <button v-if="showLogsButton" class="pb-icon-button" :aria-label="labels.logs" :title="labels.logs" @click="openLogsOverlay"><font-awesome-icon icon="fa-solid fa-file-lines" /></button>
      <details class="pb-mobile-tools">
        <summary class="pb-icon-button" :aria-label="labels.tools"><font-awesome-icon icon="fa-solid fa-ellipsis" /></summary>
        <div>
          <button :aria-label="simpleModeToggleTitle" @click="setSimpleMode(!appearanceSetting.isSimpleMode)">{{ simpleModeToggleTitle }}</button>
          <button v-if="showListViewToggle" :disabled="isListViewModeLocked" @click="handleListViewModeToggle">{{ listViewModeToggleTitle }}</button>
          <button v-if="showWideScreenNarrowModeToggle" @click="handleWideScreenNarrowModeToggle">{{ wideScreenNarrowModeToggleTitle }}</button>
        </div>
      </details>
      <button v-if="showAddButton" class="pb-create" @click="add(route)"><font-awesome-icon icon="fa-solid fa-plus" /><span>{{ labels.add }}</span></button>
    </div>
  </header>
</template>
<script lang="ts" setup>
import { useProxyBox } from '@/hooks/useProxyBox';
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import { useWideScreenNarrowMode } from "@/hooks/useWideScreenNarrowMode";
import { useGlobalStore } from "@/store/global";
import { useListViewMode } from "@/hooks/useListViewMode";
import { useSystemStore } from "@/store/system";
import { useSettingsStore } from '@/store/settings';
import { useArchiveStore } from "@/store/archive";
import { useLogsOverlayStore } from "@/store/logsOverlay";
import { useSubsStore } from "@/store/subs";
import { storeToRefs } from "pinia";
import { Dialog } from "@nutui/nutui";
import { initStores } from "@/utils/initApp";
import { useMethodStore } from '@/store/methodStore';
import { useAppNotifyStore } from "@/store/appNotify";
import { useListSearchStore } from "@/store/listSearch";
import { LOGS_PATH } from "@/utils/popupHistory";
import { resetPwaCacheAndReload } from "@/utils/pwa";
import i18n from "@/locales";

const { t:i18n_global } = i18n.global;
const { showNotify } = useAppNotifyStore();
const { t } = useI18n();
const { labels } = useProxyBox();
const router = useRouter();
const route = useRoute();
const methodStore = useMethodStore()
const globalStore = useGlobalStore();
const systemStore = useSystemStore();
const archiveStore = useArchiveStore();
const logsOverlayStore = useLogsOverlayStore();
const settingsStore = useSettingsStore();
const subsStore = useSubsStore();
const listSearchStore = useListSearchStore();
const { changeAppearanceSetting } = settingsStore;
const { appearanceSetting } = storeToRefs(settingsStore);
const { hasEntries: hasArchiveEntries } = storeToRefs(archiveStore);
const { isOpen: isLogsOverlayOpen } = storeToRefs(logsOverlayStore);
const { hasShares } = storeToRefs(subsStore);
const {
  effectiveListViewMode,
  isListViewModeLockedBySelection,
  isListViewModeLocked,
  showListViewToggle,
  toggleListViewMode,
} = useListViewMode();
const {
  isWideScreenNarrowModeActive,
  showWideScreenNarrowModeToggle,
  toggleWideScreenNarrowMode,
} = useWideScreenNarrowMode();
// 从systemStore获取状态
const { isPWA, isLandscape, isSmall } = storeToRefs(systemStore);

onMounted(() => {
  systemStore.initSystemState();
});

// 使用systemStore中的计算属性
const { navBarHeight, navBartop, navActionOffset, pwaTopPadding: Pwa_top } = storeToRefs(systemStore);
const searchInputRef = ref<HTMLInputElement | null>(null);

const isNeedBack = computed(() => {
  return route.meta.needNavBack ?? false;
});
const leftIconClass = computed(() => {
  return isNeedBack.value ? "icon-back" : "icon-home";
});

const currentTitle = computed(() => {
  if (isLogsOverlayOpen.value) {
    return t("navBar.pagesTitle.logs");
  }

  if (isListSearchActive.value) {
    return "";
  }

  const metaTitle = route.meta.title;
  return metaTitle ? t(`navBar.pagesTitle.${metaTitle}`) : undefined;
});
const currentTitleWhetherAsk = computed(() => {
  if (isLogsOverlayOpen.value || isListSearchActive.value) return "";

  const ownAsk = ["sync"];
  const metaTitle = route.meta.title;
  return ownAsk.includes(metaTitle) ? "ask" : "";
});
const showLogsButton = computed(() => route.path !== LOGS_PATH);
const showRefreshButton = computed(() => {
  return !isNeedBack.value && !appearanceSetting.value.showFloatingRefreshButton;
});
const showAddButton = computed(() => {
  return ["/subs", "/sync", "/files"].includes(route.path)
    && !appearanceSetting.value.showFloatingAddButton;
});
const showSearchButton = computed(() => {
  return Boolean(route.meta.supportsListSearch) && !isLogsOverlayOpen.value;
});
const isListSearchActive = computed(() => {
  return showSearchButton.value
    && listSearchStore.isSearchOpen
    && listSearchStore.activeRoutePath === route.path;
});
const listSearchQuery = computed({
  get: () => listSearchStore.query,
  set: (value: string) => {
    listSearchStore.setQuery(value);
  },
});
const navLeftButtonLeft = computed<Record<string, string>>(() => {
  if (isNeedBack.value) {
    if (route.path === "/shares") {
      if (!hasShares.value) {
        return {
          search: "42px",
        };
      }

      return {
        search: appearanceSetting.value.showFloatingAddButton ? "80px" : "114px",
      };
    }

    if (route.path === "/archives") {
      if (!hasArchiveEntries.value) {
        return {
          search: "42px",
        };
      }

      return {
        search: "80px",
      };
    }

    return {
      search: "42px",
    };
  }

  const buttons: string[] = [];
  if (showRefreshButton.value) {
    buttons.push("refresh");
  }
  if (showAddButton.value) {
    buttons.push("add");
  }
  if (showSearchButton.value) {
    buttons.push("search");
  }

  return buttons.reduce((acc, key, index) => {
    acc[key] = `${7 + index * 30}px`;
    return acc;
  }, {} as Record<string, string>);
});

watch(
  () => route.path,
  () => {
    listSearchStore.syncRoute(route.path, Boolean(route.meta.supportsListSearch));
  },
  { immediate: true },
);

const focusSearchInput = async () => {
  await nextTick();
  searchInputRef.value?.focus();
};

const openListSearch = async () => {
  listSearchStore.open(route.path);
  await focusSearchInput();
};

const closeListSearch = () => {
  listSearchStore.close();
};

const handleSearchCloseButton = async () => {
  if (listSearchQuery.value) {
    listSearchStore.setQuery("");
    await focusSearchInput();
    return;
  }

  closeListSearch();
};
const onClickNavbarIcon = () => {
  const metaTitle = route.meta.title;
  const content =
    t(`navBar.pagesTitle.askWhat.${metaTitle}.content`) || "";
  const title = t(`navBar.pagesTitle.askWhat.${metaTitle}.title`) || "";
    Dialog({
      title: title,
      content: content,
      popClass: 'auto-dialog',
      textAlign: 'left',
      okText: 'OK',
      noCancelBtn: true,
      closeOnPopstate: true,
      lockScroll: false,
    });
};

const add = (route: any) => {
  const routePath = route.path;
  const addMethodMap = {
    "/subs": "addSub",
    "/files": "addFile",
    "/sync": "addSync",
  };
  methodStore.invokeMethod(addMethodMap[routePath], {});
};

const back = () => {
  if (isLogsOverlayOpen.value) {
    logsOverlayStore.close();
    return;
  }

  if (isNeedBack.value) {
    try {
      if (router.options.history.state.back) {
        router.back();
      } else {
        router.push("/");
      }
    } catch (error) {
      router.push("/");
    }
  }
};

const setSimpleMode = (isSimpleMode: boolean) => {
  // globalStore.setSimpleMode(isSimpleMode);
  const data = {
    ...appearanceSetting.value,
    isSimpleMode: isSimpleMode
  }
  changeAppearanceSetting({ appearanceSetting: data })
};

const listViewModeToggleTitle = computed(() => {
  if (isListViewModeLockedBySelection.value) {
    return t("navBar.listView.disabledInSelectionMode");
  }

  return effectiveListViewMode.value === "dual-column"
    ? t("navBar.listView.switchToSingle")
    : t("navBar.listView.switchToDual");
});

const wideScreenNarrowModeToggleTitle = computed(() => {
  return isWideScreenNarrowModeActive.value
    ? t("navBar.navigationMode.switchToWide")
    : t("navBar.navigationMode.switchToNarrow");
});

const simpleModeToggleTitle = computed(() => {
  return appearanceSetting.value.isSimpleMode
    ? t("navBar.simpleMode.switchToNormal")
    : t("navBar.simpleMode.switchToSimple");
});

const NAV_BAR_RIGHT_BUTTON_BASE_RIGHT = 15;
const NAV_BAR_RIGHT_BUTTON_GAP = 34;

const navRightButtonRight = computed<Record<string, string>>(() => {
  const buttons: string[] = [];
  if (showLogsButton.value) {
    buttons.push("logs");
  }
  buttons.push("simple");
  if (showWideScreenNarrowModeToggle.value) {
    buttons.push("navigation");
  }
  if (showListViewToggle.value) {
    buttons.push("list");
  }

  return buttons.reduce((acc, key, index) => {
    acc[key] = `${NAV_BAR_RIGHT_BUTTON_BASE_RIGHT + index * NAV_BAR_RIGHT_BUTTON_GAP}px`;
    return acc;
  }, {} as Record<string, string>);
});

const handleListViewModeToggle = async () => {
  if (isListViewModeLocked.value) {
    return;
  }

  await toggleListViewMode();
};

const handleWideScreenNarrowModeToggle = async () => {
  await toggleWideScreenNarrowMode();
};

const openLogsOverlay = () => {
  logsOverlayStore.open();
};

const refresh = async () => {
  if (["/preview"].includes(route.path)) {
    window.location.reload();
  } else if (["/subs", "/sync", "/files"].includes(route.path)) {
    initStores(true, true, true);
  } else {
    await resetPwaCacheAndReload({ notify: showNotify, t: i18n_global });
  }
};
</script>

