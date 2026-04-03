<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Domain } from '../types/domain'
import DomainTableRow from './DomainTableRow.vue'

const props = defineProps<{ domains: Domain[] }>()
defineEmits<{ select: [domain: Domain] }>()

type SortKey = 'domain' | 'registrar' | 'status' | 'created_at' | 'expires_at' | 'updated_at'
type SortDir = 'asc' | 'desc'

const sortKey = ref<SortKey>('domain')
const sortDir = ref<SortDir>('asc')

const sortedDomains = computed(() => {
  return [...props.domains].sort((a, b) => {
    const aVal = a[sortKey.value] ?? ''
    const bVal = b[sortKey.value] ?? ''
    const cmp = String(aVal).localeCompare(String(bVal))
    return sortDir.value === 'asc' ? cmp : -cmp
  })
})

function toggleSort(key: SortKey) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = 'asc'
  }
}

function ariaSortAttr(key: SortKey): 'ascending' | 'descending' | 'none' {
  if (sortKey.value !== key) return 'none'
  return sortDir.value === 'asc' ? 'ascending' : 'descending'
}

const columns: { key: SortKey; label: string }[] = [
  { key: 'domain', label: 'Domain' },
  { key: 'registrar', label: 'Registrar' },
  { key: 'status', label: 'Status' },
  { key: 'created_at', label: 'Created' },
  { key: 'expires_at', label: 'Expires' },
  { key: 'updated_at', label: 'Updated' },
]
</script>

<template>
  <div class="table-scroll-wrapper">
    <table class="domain-table">
      <thead>
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            scope="col"
            tabindex="0"
            class="domain-table__th"
            :class="{ 'domain-table__th--active': sortKey === col.key }"
            :aria-sort="ariaSortAttr(col.key)"
            @click="toggleSort(col.key)"
            @keydown.enter="toggleSort(col.key)"
            @keydown.space.prevent="toggleSort(col.key)"
          >
            {{ col.label }}
            <span class="domain-table__sort-icon" aria-hidden="true">
              <template v-if="sortKey === col.key">
                {{ sortDir === 'asc' ? '↑' : '↓' }}
              </template>
              <template v-else>↕</template>
            </span>
          </th>
        </tr>
      </thead>
      <tbody>
        <DomainTableRow
          v-for="domain in sortedDomains"
          :key="domain.domain"
          :domain="domain"
          @select="$emit('select', $event)"
        />
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.table-scroll-wrapper {
  overflow-x: auto;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  background-color: var(--color-surface);
}

.domain-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 640px;
}

.domain-table__th {
  padding: 12px 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  background-color: var(--color-surface);
  border-bottom: 2px solid var(--color-border);
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  transition: color var(--transition-fast);
}

.domain-table__th:hover,
.domain-table__th--active {
  color: var(--color-text);
}

.domain-table__sort-icon {
  display: inline-block;
  margin-left: 4px;
  font-size: 11px;
  opacity: 0.5;
}

.domain-table__th--active .domain-table__sort-icon {
  opacity: 1;
  color: var(--color-primary);
}
</style>
