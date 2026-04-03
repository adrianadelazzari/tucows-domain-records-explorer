<script setup lang="ts">
defineProps<{ type: 'empty' | 'error' | 'no-results' }>()
defineEmits<{ retry: [] }>()

const config = {
  empty: {
    icon: '📭',
    heading: 'No domains yet',
    message: 'There are no domain records to display.',
  },
  error: {
    icon: '⚠️',
    heading: 'Something went wrong',
    message: 'Failed to load domain records.',
  },
  'no-results': {
    icon: '🔍',
    heading: 'No results found',
    message: 'No domains match your current filters.',
  },
}
</script>

<template>
  <div
    class="empty-state"
    :class="`empty-state--${type}`"
    :role="type === 'error' ? 'alert' : undefined"
    :aria-live="type !== 'error' ? 'polite' : undefined"
  >
    <span class="empty-state__icon" aria-hidden="true">{{ config[type].icon }}</span>
    <h2 class="empty-state__heading">{{ config[type].heading }}</h2>
    <p class="empty-state__message">{{ config[type].message }}</p>
    <button v-if="type === 'error'" class="empty-state__retry" @click="$emit('retry')">
      Try again
    </button>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 64px 24px;
  text-align: center;
}

.empty-state__icon {
  font-size: 40px;
  line-height: 1;
  margin-bottom: 4px;
}

.empty-state__heading {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
}

.empty-state__message {
  font-size: 14px;
  color: var(--color-text-muted);
  max-width: 320px;
}

.empty-state__retry {
  margin-top: 8px;
  padding: 8px 20px;
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
  border: none;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  transition: background-color var(--transition-fast);
}

.empty-state__retry:hover {
  background-color: var(--color-primary-hover);
}
</style>
