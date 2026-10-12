<template>
  <Teleport to="body">
    <div v-if="isOpen" class="logs-overlay-backdrop" aria-hidden="true" />
    <section v-if="isOpen" class="logs-overlay-panel" role="dialog" aria-modal="true" :aria-label="$t('navBar.pagesTitle.logs')">
      <header class="pb-panel-header"><h2>{{ $t('navBar.pagesTitle.logs') }}</h2><button class="pb-icon-button" :aria-label="$t('logsPage.floating.close')" @click="logsOverlayStore.close()"><font-awesome-icon icon="fa-solid fa-xmark" /></button></header>
      <LogsPanel mode="overlay" />
    </section>
  </Teleport>
</template>

<script lang="ts" setup>
import { storeToRefs } from "pinia";
import { computed } from "vue";

import LogsPanel from "@/components/LogsPanel.vue";
import { useLogsOverlayStore } from "@/store/logsOverlay";
import { useSystemStore } from "@/store/system";

const logsOverlayStore = useLogsOverlayStore();
const systemStore = useSystemStore();
const { isOpen } = storeToRefs(logsOverlayStore);
const { navBartop, navBarHeight } = storeToRefs(systemStore);

const navActionOffset = computed(() => {
  const navBarHeightNum = Number.parseFloat(navBarHeight.value || "56");
  const navBarTopNum = Number.parseFloat(navBartop.value || "0");
  return `${(navBarHeightNum + navBarTopNum) / 2}px`;
});
</script>

<style scoped lang="scss">
.logs-overlay-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1001;
  background: var(--background-color);
}

.logs-overlay-panel {
  @include centered-fixed-container;
  top: 56px;
  bottom: 0;
  z-index: 1002;
  box-sizing: border-box;
  overflow: hidden;
  background: var(--background-color);
}

.logs-overlay-close-layer {
  @include centered-fixed-container;
  top: 0;
  height: 56px;
  z-index: 1006;
  pointer-events: none;
}

.logs-overlay-close-button {
  position: absolute;
  left: 7px;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  padding: 0;
  border: 0;
  margin: 0;
  background: transparent;
  color: var(--icon-nav-bar-right);
  cursor: pointer;
  pointer-events: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  :deep(svg) {
    width: 14px !important;
    height: 14px !important;
    font-size: 14px !important;
  }

  &:focus {
    outline: none;
  }
}
</style>
