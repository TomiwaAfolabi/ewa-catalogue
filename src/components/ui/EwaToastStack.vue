<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useToastStore } from '@/stores/toastStore'

const toast = useToastStore()
const { items } = storeToRefs(toast)
</script>

<template>
  <Teleport to="body">
    <div class="toast-stack" aria-live="polite">
      <TransitionGroup name="toast" tag="div" class="toast-list">
        <div
          v-for="t in items"
          :key="t.id"
          :class="['toast', `toast--${t.variant}`]"
          role="status"
        >
          <span class="toast-text">{{ t.message }}</span>
          <button
            type="button"
            class="toast-dismiss"
            aria-label="Dismiss notification"
            @click="toast.dismiss(t.id)"
          >
            ×
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-stack {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 9999;
  pointer-events: none;
  max-width: min(380px, calc(100vw - 32px));
}

.toast-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-end;
}

.toast {
  pointer-events: auto;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  font-size: 0.875rem;
  line-height: 1.45;
}

.toast--error {
  background: #fff5f4;
  border: 1px solid #e8a9a1;
  color: #6b1f18;
}

.toast--success {
  background: #f0faf4;
  border: 1px solid #9dceb5;
  color: #1e4d32;
}

.toast--info {
  background: #f5f8ff;
  border: 1px solid #a8c0e8;
  color: #1a3566;
}

.toast-text {
  flex: 1;
  min-width: 0;
}

.toast-dismiss {
  flex-shrink: 0;
  margin: -4px -6px -4px 0;
  padding: 4px 8px;
  border: none;
  background: transparent;
  color: inherit;
  opacity: 0.65;
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
  border-radius: 4px;
}

.toast-dismiss:hover {
  opacity: 1;
}

.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(12px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(8px);
}

.toast-move {
  transition: transform 0.2s ease;
}
</style>
