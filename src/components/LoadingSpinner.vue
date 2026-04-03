<script setup lang="ts"></script>

<template>
  <div class="spinner-wrapper" role="status" aria-label="Loading">
    <div class="spinner" />
  </div>
</template>

<style scoped>
.spinner-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 48px 0;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
