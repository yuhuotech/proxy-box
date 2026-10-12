<template>
  <section class="pb-about">
    <div class="pb-about-hero"><img src="/proxy-box.svg" alt="" /><div><h2>ProxyBox</h2><p>{{ labels.forkNotice }}</p><span>Frontend v{{ version }} · Backend v{{ env.version || '—' }}</span></div></div>
    <div class="pb-about-grid">
      <article class="pb-info-card"><h3>{{ labels.about }}</h3><p>{{ labels.copyright }}</p><p>{{ labels.legal }}</p><div class="pb-link-row"><a href="/licenses/AGPL-3.0.txt" target="_blank" rel="noopener">AGPL-3.0 · {{ labels.backend }}</a><a href="/licenses/GPL-3.0.txt" target="_blank" rel="noopener">GPL-3.0 · {{ labels.frontend }}</a></div></article>
      <article class="pb-info-card"><h3>{{ labels.source }}</h3><p>{{ labels.upstream }}</p><div class="pb-link-row"><a :href="SOURCE_URL" target="_blank" rel="noopener">ProxyBox · {{ labels.source }} ↗</a><a :href="SOURCE_REPO + '/blob/master/docs/CHANGELOG.md'" target="_blank" rel="noopener">{{ labels.changes }} ↗</a></div><div class="pb-link-row"><a href="https://github.com/sub-store-org/Sub-Store" target="_blank" rel="noopener">Sub-Store ↗</a><a href="https://github.com/sub-store-org/Sub-Store-Front-End" target="_blank" rel="noopener">Sub-Store Frontend ↗</a></div></article>
    </div>
  </section>
</template>
<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useGlobalStore } from '@/store/global';
import { useProxyBox, SOURCE_URL, SOURCE_REPO } from '@/hooks/useProxyBox';
const { labels } = useProxyBox(); const { env } = storeToRefs(useGlobalStore());
const version = import.meta.env.PACKAGE_VERSION;
</script>
