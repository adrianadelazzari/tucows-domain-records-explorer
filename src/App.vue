<script setup lang="ts">
import { ref } from 'vue'
import type { Domain } from './types/domain'
import { useDomains } from './composables/useDomains'
import DomainFilters from './components/DomainFilters.vue'
import DomainTable from './components/DomainTable.vue'
import DomainDetail from './components/DomainDetail.vue'
import LoadingSpinner from './components/LoadingSpinner.vue'
import EmptyState from './components/EmptyState.vue'

const {
  filteredDomains,
  loading,
  error,
  searchQuery,
  selectedRegistrar,
  selectedStatus,
  registrarOptions,
  loadDomains,
  clearFilters,
} = useDomains()

const selectedDomain = ref<Domain | null>(null)
const detailOpen = ref(false)

function openDetail(domain: Domain) {
  selectedDomain.value = domain
  detailOpen.value = true
}

function closeDetail() {
  detailOpen.value = false
}
</script>

<template>
  <div class="app">
    <header class="app__header">
      <div class="app__header-inner">
        <h1 class="app__title">Domain Records Explorer</h1>
        <p class="app__subtitle">Search and inspect domain registration records</p>
      </div>
    </header>

    <main class="app__main" aria-label="Domain records explorer">
      <DomainFilters
        v-model:search="searchQuery"
        v-model:registrar="selectedRegistrar"
        v-model:status="selectedStatus"
        :registrar-options="registrarOptions"
        @clear="clearFilters"
      />

      <p class="sr-only" aria-live="polite" aria-atomic="true">
        <template v-if="!loading && !error">
          {{ filteredDomains.length }} domain{{ filteredDomains.length === 1 ? '' : 's' }} shown
        </template>
      </p>

      <div class="app__results">
        <LoadingSpinner v-if="loading" />

        <EmptyState v-else-if="error" type="error" @retry="loadDomains" />

        <EmptyState
          v-else-if="!filteredDomains.length && (searchQuery || selectedRegistrar || selectedStatus)"
          type="no-results"
        />

        <EmptyState v-else-if="!filteredDomains.length" type="empty" />

        <DomainTable v-else :domains="filteredDomains" @select="openDetail" />
      </div>
    </main>

    <DomainDetail :domain="selectedDomain" :open="detailOpen" @close="closeDetail" />
  </div>
</template>

<style scoped>
.app {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

.app__header {
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

.app__header-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 24px;
}

.app__title {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text);
}

.app__subtitle {
  font-size: 13px;
  color: var(--color-text-muted);
  margin-top: 2px;
}

.app__main {
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.app__results {
  flex: 1;
}
</style>
