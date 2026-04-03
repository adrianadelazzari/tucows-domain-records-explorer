<script setup lang="ts">
import type { DomainStatus } from '../types/domain'

defineProps<{ registrarOptions: string[] }>()
defineEmits<{ clear: [] }>()

const search = defineModel<string>('search', { default: '' })
const registrar = defineModel<string>('registrar', { default: '' })
const status = defineModel<DomainStatus | ''>('status', { default: '' })

const statusOptions: { value: DomainStatus | ''; label: string }[] = [
  { value: '', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'clientHold', label: 'Client Hold' },
  { value: 'pendingTransfer', label: 'Pending Transfer' },
]
</script>

<template>
  <div class="filters">
    <div class="filters__field">
      <label for="filter-search" class="filters__label">Search</label>
      <input
        id="filter-search"
        v-model="search"
        type="search"
        class="filters__input"
        placeholder="Search domains…"
        aria-label="Search domains by name"
      />
    </div>

    <div class="filters__field">
      <label for="filter-registrar" class="filters__label">Registrar</label>
      <select
        id="filter-registrar"
        v-model="registrar"
        class="filters__select"
        aria-label="Filter by registrar"
      >
        <option value="">All registrars</option>
        <option v-for="r in registrarOptions" :key="r" :value="r">{{ r }}</option>
      </select>
    </div>

    <div class="filters__field">
      <label for="filter-status" class="filters__label">Status</label>
      <select
        id="filter-status"
        v-model="status"
        class="filters__select"
        aria-label="Filter by status"
      >
        <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
    </div>

    <button class="filters__clear" @click="$emit('clear')">Clear filters</button>
  </div>
</template>

<style scoped>
.filters {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 12px;
  padding: 16px;
  background-color: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

.filters__field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 180px;
  flex: 1;
}

.filters__label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
}

.filters__input,
.filters__select {
  height: 36px;
  padding: 0 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: var(--color-surface);
  font-family: inherit;
  font-size: 14px;
  color: var(--color-text);
  transition: border-color var(--transition-fast);
}

.filters__input:focus,
.filters__select:focus {
  outline: none;
  border-color: var(--color-primary);
}

.filters__clear {
  height: 36px;
  padding: 0 16px;
  background-color: transparent;
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  color: var(--color-primary);
  align-self: flex-end;
  transition:
    background-color var(--transition-fast),
    color var(--transition-fast);
}

.filters__clear:hover {
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
}

@media (max-width: 640px) {
  .filters__field {
    min-width: 100%;
  }

  .filters__clear {
    width: 100%;
  }
}
</style>
