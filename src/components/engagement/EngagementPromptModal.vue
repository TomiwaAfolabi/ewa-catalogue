<script setup lang="ts">
import type { EngagementPrompt } from '@/types'

defineProps<{
  open: boolean
  prompt: EngagementPrompt | null
  busy?: boolean
}>()

const emit = defineEmits<{
  dismiss: []
  makeRequest: []
}>()
</script>

<template>
  <Teleport to="body">
    <Transition name="engage-modal">
      <div
        v-if="open && prompt"
        class="engage-root"
        role="dialog"
        aria-modal="true"
        aria-labelledby="engage-modal-title"
        aria-describedby="engage-modal-desc"
      >
        <button type="button" class="engage-backdrop" aria-label="Close" @click="emit('dismiss')" />
        <div class="engage-panel">
          <header class="engage-head">
            <p class="engage-eyebrow">While you’re here</p>
            <h2 id="engage-modal-title" class="engage-title">We’d love to hear from you</h2>
          </header>
          <p id="engage-modal-desc" class="engage-message">{{ prompt.message }}</p>
          <div class="engage-actions">
            <button
              type="button"
              class="engage-btn engage-btn--primary"
              :disabled="busy"
              @click="emit('makeRequest')"
            >
              Make a request
            </button>
            <button
              type="button"
              class="engage-btn engage-btn--ghost"
              :disabled="busy"
              @click="emit('dismiss')"
            >
              {{ busy ? 'Closing…' : 'Not now' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.engage-root {
  position: fixed;
  inset: 0;
  z-index: 310;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
}

.engage-backdrop {
  position: absolute;
  inset: 0;
  border: none;
  margin: 0;
  padding: 0;
  background: rgba(12, 8, 6, 0.82);
  cursor: pointer;
}

.engage-panel {
  position: relative;
  width: min(440px, 100%);
  padding: 28px 24px 24px;
  border-radius: calc(var(--radius-md) + 2px);
  background: #faf6ef;
  border: 1px solid rgba(201, 168, 76, 0.28);
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

.engage-head {
  margin-bottom: 14px;
}

.engage-eyebrow {
  margin: 0 0 6px;
  font-family: var(--font-sans);
  font-size: 10px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: rgba(92, 64, 51, 0.75);
}

.engage-title {
  margin: 0;
  font-family: var(--font-serif);
  font-size: 1.45rem;
  font-weight: 400;
  color: #2c1810;
  line-height: 1.2;
}

.engage-message {
  margin: 0 0 22px;
  font-size: 0.95rem;
  line-height: 1.6;
  color: #5c4033;
}

.engage-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.engage-btn {
  width: 100%;
  padding: 13px 18px;
  border-radius: var(--radius-sm);
  font-family: var(--font-sans);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  cursor: pointer;
  transition: opacity 0.15s ease, filter 0.15s ease;
}

.engage-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.engage-btn--primary {
  border: none;
  background: var(--terra);
  color: var(--ivory);
}

.engage-btn--primary:not(:disabled):hover {
  filter: brightness(1.06);
}

.engage-btn--ghost {
  border: 1px solid rgba(44, 24, 16, 0.2);
  background: transparent;
  color: #5c4033;
}

.engage-btn--ghost:not(:disabled):hover {
  border-color: var(--terra);
  color: var(--terra);
}

.engage-btn:focus-visible {
  outline: 2px solid var(--terra);
  outline-offset: 3px;
}

.engage-modal-enter-active,
.engage-modal-leave-active {
  transition: opacity 0.22s ease;
}

.engage-modal-enter-active .engage-panel,
.engage-modal-leave-active .engage-panel {
  transition: transform 0.22s ease, opacity 0.22s ease;
}

.engage-modal-enter-from,
.engage-modal-leave-to {
  opacity: 0;
}

.engage-modal-enter-from .engage-panel,
.engage-modal-leave-to .engage-panel {
  opacity: 0;
  transform: translateY(12px) scale(0.98);
}
</style>
