<script setup lang="ts">
import type { DomainStatus } from '../types/domain'

defineProps<{ status: DomainStatus }>()

const labels: Record<DomainStatus, string> = {
  active: 'Active',
  clientHold: 'Client Hold',
  pendingTransfer: 'Pending Transfer',
}
</script>

<template>
  <span class="badge" :class="`badge--${status}`">{{ labels[status] }}</span>
</template>

<style scoped>
.badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.badge--active {
  color: var(--color-active);
  background-color: var(--color-active-bg);
}

.badge--clientHold {
  color: var(--color-hold);
  background-color: var(--color-hold-bg);
}

.badge--pendingTransfer {
  color: var(--color-pending);
  background-color: var(--color-pending-bg);
}
</style>
