<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import type { Domain } from '../types/domain'
import StatusBadge from './StatusBadge.vue'

const props = defineProps<{ domain: Domain | null; open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const modalRef = ref<HTMLElement | null>(null)
const closeButtonRef = ref<HTMLButtonElement | null>(null)
const previousFocus = ref<HTMLElement | null>(null)

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      previousFocus.value = document.activeElement as HTMLElement
      await nextTick()
      closeButtonRef.value?.focus()
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      previousFocus.value?.focus()
      previousFocus.value = null
    }
  },
)

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    emit('close')
    return
  }

  if (e.key !== 'Tab' || !modalRef.value) return

  const focusable = modalRef.value.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  )
  const first = focusable[0]
  const last = focusable[focusable.length - 1]

  if (!first || !last) return

  if (e.shiftKey) {
    if (document.activeElement === first) {
      e.preventDefault()
      last.focus()
    }
  } else {
    if (document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function expiryWarning(iso: string | null | undefined): 'expired' | 'soon' | null {
  if (!iso) return null
  const expires = new Date(iso)
  const now = new Date()
  if (expires < now) return 'expired'
  if (expires.getTime() - now.getTime() < 30 * 24 * 60 * 60 * 1000) return 'soon'
  return null
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="overlay" aria-hidden="true" @click="emit('close')" />
    </Transition>

    <Transition name="pop">
      <div
        v-if="open"
        ref="modalRef"
        class="modal"
        role="dialog"
        aria-modal="true"
        :aria-label="domain ? `Details for ${domain.domain}` : 'Domain details'"
        @keydown="onKeydown"
      >
        <header class="modal__header">
          <div class="modal__title-group">
            <h2 class="modal__title">{{ domain?.domain ?? '—' }}</h2>
            <StatusBadge v-if="domain" :status="domain.status" />
          </div>
          <button
            ref="closeButtonRef"
            class="modal__close"
            aria-label="Close"
            @click="emit('close')"
          >
            ✕
          </button>
        </header>

        <div v-if="domain" class="modal__body">
          <dl class="detail-list">
            <div class="detail-list__row">
              <dt class="detail-list__term">Registrar</dt>
              <dd class="detail-list__desc">{{ domain.registrar ?? '—' }}</dd>
            </div>

            <div class="detail-list__row">
              <dt class="detail-list__term">Created</dt>
              <dd class="detail-list__desc">{{ formatDate(domain.created_at) }}</dd>
            </div>

            <div class="detail-list__row">
              <dt class="detail-list__term">Expires</dt>
              <dd
                class="detail-list__desc"
                :class="{
                  'detail-list__desc--expired': expiryWarning(domain.expires_at) === 'expired',
                  'detail-list__desc--soon': expiryWarning(domain.expires_at) === 'soon',
                }"
              >
                {{ formatDate(domain.expires_at) }}
                <span
                  v-if="expiryWarning(domain.expires_at) === 'expired'"
                  class="detail-list__tag detail-list__tag--expired"
                  >Expired</span
                >
                <span
                  v-else-if="expiryWarning(domain.expires_at) === 'soon'"
                  class="detail-list__tag detail-list__tag--soon"
                  >Expiring soon</span
                >
              </dd>
            </div>

            <div class="detail-list__row">
              <dt class="detail-list__term">Last updated</dt>
              <dd class="detail-list__desc">{{ formatDate(domain.updated_at) }}</dd>
            </div>

            <div class="detail-list__row detail-list__row--nameservers">
              <dt class="detail-list__term">Nameservers</dt>
              <dd class="detail-list__desc">
                <ul v-if="domain.nameservers?.length" class="nameserver-list">
                  <li v-for="ns in domain.nameservers" :key="ns" class="nameserver-list__item">
                    {{ ns }}
                  </li>
                </ul>
                <span v-else>—</span>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 100;
}

.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(560px, calc(100vw - 32px));
  max-height: min(680px, calc(100dvh - 32px));
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-panel);
  z-index: 101;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 24px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.modal__title-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.modal__title-group :deep(.badge) {
  font-size: 11px;
  padding: 1px 8px;
  align-self: flex-start;
}

.modal__title {
  font-family: var(--font-mono);
  font-size: 16px;
  font-weight: 600;
  word-break: break-all;
  color: var(--color-text);
}

.modal__close {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 14px;
  color: var(--color-text-muted);
  transition:
    background-color var(--transition-fast),
    color var(--transition-fast);
}

.modal__close:hover {
  background-color: var(--color-border-light);
  color: var(--color-text);
}

.modal__body {
  flex: 1;
  overflow-y: auto;
  padding: 8px 24px 24px;
}

.detail-list {
  display: flex;
  flex-direction: column;
}

.detail-list__row {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 8px;
  padding: 14px 0;
  border-bottom: 1px solid var(--color-border-light);
}

.detail-list__row:last-child {
  border-bottom: none;
}

.detail-list__row--nameservers {
  align-items: start;
}

.detail-list__term {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  padding-top: 2px;
}

.detail-list__desc {
  font-size: 14px;
  color: var(--color-text);
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.detail-list__desc--expired {
  color: var(--color-danger);
}

.detail-list__desc--soon {
  color: var(--color-warning);
}

.detail-list__tag {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 999px;
}

.detail-list__tag--expired {
  background-color: var(--color-danger-bg);
  color: var(--color-danger);
}

.detail-list__tag--soon {
  background-color: var(--color-warning-bg);
  color: var(--color-warning);
}

.nameserver-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nameserver-list__item {
  font-family: var(--font-mono);
  font-size: 13px;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-base);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.pop-enter-active,
.pop-leave-active {
  transition:
    opacity var(--transition-base),
    transform var(--transition-base);
}

.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: translate(-50%, -48%) scale(0.96);
}
</style>
