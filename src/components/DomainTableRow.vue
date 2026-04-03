<script setup lang="ts">
import { computed } from 'vue'
import type { Domain } from '../types/domain'
import StatusBadge from './StatusBadge.vue'

const props = defineProps<{ domain: Domain }>()
defineEmits<{ select: [domain: Domain] }>()

const expiryState = computed(() => {
  if (!props.domain.expires_at) return 'none'
  const expires = new Date(props.domain.expires_at)
  const now = new Date()
  const thirtyDays = 30 * 24 * 60 * 60 * 1000
  if (expires < now) return 'expired'
  if (expires.getTime() - now.getTime() < thirtyDays) return 'soon'
  return 'ok'
})

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<template>
  <tr
    class="domain-row"
    :class="{
      'domain-row--expired': expiryState === 'expired',
      'domain-row--expires-soon': expiryState === 'soon',
    }"
    tabindex="0"
    @click="$emit('select', domain)"
    @keydown.enter="$emit('select', domain)"
    @keydown.space.prevent="$emit('select', domain)"
  >
    <td class="domain-row__cell domain-row__cell--domain">{{ domain.domain }}</td>
    <td class="domain-row__cell">{{ domain.registrar ?? '—' }}</td>
    <td class="domain-row__cell">
      <StatusBadge :status="domain.status" />
    </td>
    <td class="domain-row__cell domain-row__cell--date">{{ formatDate(domain.created_at) }}</td>
    <td class="domain-row__cell domain-row__cell--date" :class="`domain-row__expiry--${expiryState}`">
      {{ formatDate(domain.expires_at) }}
    </td>
    <td class="domain-row__cell domain-row__cell--date">{{ formatDate(domain.updated_at) }}</td>
  </tr>
</template>

<style scoped>
.domain-row {
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.domain-row:hover,
.domain-row:focus {
  background-color: var(--color-border-light);
  outline: none;
}

.domain-row--expired {
  background-color: var(--color-danger-bg);
}

.domain-row--expired:hover,
.domain-row--expired:focus {
  background-color: #ffe4e4;
}

.domain-row--expires-soon {
  background-color: var(--color-warning-bg);
}

.domain-row--expires-soon:hover,
.domain-row--expires-soon:focus {
  background-color: #fef0c0;
}

.domain-row__cell {
  padding: 12px 16px;
  font-size: 14px;
  color: var(--color-text);
  border-bottom: 1px solid var(--color-border-light);
  white-space: nowrap;
}

.domain-row__cell--domain {
  font-family: var(--font-mono);
  font-weight: 500;
}

.domain-row__cell--date {
  color: var(--color-text-muted);
}

.domain-row__expiry--expired {
  color: var(--color-danger);
  font-weight: 600;
}

.domain-row__expiry--soon {
  color: var(--color-warning);
  font-weight: 600;
}
</style>
