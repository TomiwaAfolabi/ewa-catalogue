<!--
  EWA — custom route / data loader (CSS only, WCAG status role)
-->
<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    /** Short phrase for screen readers */
    label?: string
    /** Visual scale */
    size?: 'sm' | 'md' | 'lg'
    /**
     * `inline` — spinner only (embed in panels).
     * `overlay` — dimmed full-viewport layer (route transitions).
     */
    variant?: 'inline' | 'overlay'
    /** Optional caption under the spinner (visible) */
    message?: string
  }>(),
  {
    label: 'Loading',
    size: 'md',
    variant: 'inline',
    message: '',
  },
)

const sizeClass = computed(() => `ewa-page-spinner--${props.size}`)
</script>

<template>
  <div
    v-if="variant === 'overlay'"
    class="ewa-page-spinner-overlay"
    role="status"
    :aria-label="label"
    aria-live="polite"
    aria-busy="true"
  >
    <div class="ewa-page-spinner-card">
      <div class="ewa-page-spinner" :class="sizeClass">
        <div class="ewa-page-spinner__rings" aria-hidden="true">
          <span class="ewa-page-spinner__ring ewa-page-spinner__ring--a" />
          <span class="ewa-page-spinner__ring ewa-page-spinner__ring--b" />
          <span class="ewa-page-spinner__ring ewa-page-spinner__ring--c" />
        </div>
        <span class="ewa-page-spinner__core" aria-hidden="true" />
      </div>
      <p v-if="message" class="ewa-page-spinner__msg">{{ message }}</p>
    </div>
  </div>

  <div
    v-else
    class="ewa-page-spinner-wrap"
    role="status"
    :aria-label="label"
    aria-live="polite"
    aria-busy="true"
  >
    <div class="ewa-page-spinner" :class="sizeClass">
      <div class="ewa-page-spinner__rings" aria-hidden="true">
        <span class="ewa-page-spinner__ring ewa-page-spinner__ring--a" />
        <span class="ewa-page-spinner__ring ewa-page-spinner__ring--b" />
        <span class="ewa-page-spinner__ring ewa-page-spinner__ring--c" />
      </div>
      <span class="ewa-page-spinner__core" aria-hidden="true" />
    </div>
    <p v-if="message" class="ewa-page-spinner__msg ewa-page-spinner__msg--inline">{{ message }}</p>
  </div>
</template>

<style scoped>
/* ── Overlay (route changes) ───────────────────────── */
.ewa-page-spinner-overlay {
  position: fixed;
  inset: 0;
  z-index: 90;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(20, 12, 9, 0.72);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.ewa-page-spinner-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 36px 44px;
  border-radius: 16px;
  background: rgba(250, 246, 239, 0.06);
  border: 1px solid rgba(201, 168, 76, 0.22);
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.35);
}

/* ── Inline wrapper ─────────────────────────────────── */
.ewa-page-spinner-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
}

/* ── Spinner core ─────────────────────────────────── */
.ewa-page-spinner {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ewa-page-spinner--sm {
  width: 40px;
  height: 40px;
}
.ewa-page-spinner--md {
  width: 56px;
  height: 56px;
}
.ewa-page-spinner--lg {
  width: 72px;
  height: 72px;
}

.ewa-page-spinner__rings {
  position: absolute;
  inset: 0;
  animation: ewa-orbit 1.35s linear infinite;
}

.ewa-page-spinner__ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border-style: solid;
  border-color: transparent;
}

.ewa-page-spinner__ring--a {
  border-width: 3px;
  border-top-color: var(--terra);
  border-right-color: rgba(181, 82, 42, 0.25);
  opacity: 1;
}

.ewa-page-spinner__ring--b {
  inset: 6px;
  border-width: 2px;
  border-bottom-color: var(--gold);
  border-left-color: rgba(201, 168, 76, 0.2);
  animation: ewa-counter 2.4s linear infinite;
}

.ewa-page-spinner--sm .ewa-page-spinner__ring--b {
  inset: 4px;
}
.ewa-page-spinner--lg .ewa-page-spinner__ring--b {
  inset: 8px;
}

.ewa-page-spinner__ring--c {
  inset: 12px;
  border-width: 2px;
  border-top-color: rgba(250, 246, 239, 0.35);
  border-right-color: transparent;
}

.ewa-page-spinner--sm .ewa-page-spinner__ring--c {
  inset: 8px;
}
.ewa-page-spinner--lg .ewa-page-spinner__ring--c {
  inset: 16px;
}

.ewa-page-spinner__core {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, var(--gold-light), var(--gold));
  box-shadow: 0 0 14px rgba(201, 168, 76, 0.45);
  animation: ewa-pulse 1.1s ease-in-out infinite;
}

.ewa-page-spinner--sm .ewa-page-spinner__core {
  width: 7px;
  height: 7px;
}
.ewa-page-spinner--lg .ewa-page-spinner__core {
  width: 12px;
  height: 12px;
}

@keyframes ewa-orbit {
  to {
    transform: rotate(360deg);
  }
}

@keyframes ewa-counter {
  to {
    transform: rotate(-360deg);
  }
}

@keyframes ewa-pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(0.88);
    opacity: 0.75;
  }
}

.ewa-page-spinner__msg {
  margin: 0;
  font-family: var(--font-sans);
  font-size: 0.68rem;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: rgba(250, 246, 239, 0.72);
}

.ewa-page-spinner__msg--inline {
  color: rgba(250, 246, 239, 0.85);
  letter-spacing: 0.2em;
}
</style>
