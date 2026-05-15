<script setup lang="ts">
import type { SavedShippingAddress } from '@/composables/useAddressBook'

defineProps<{
  open: boolean
  addresses: SavedShippingAddress[]
}>()

const emit = defineEmits<{
  close: []
  select: [address: SavedShippingAddress]
  remove: [id: string]
}>()

function formatLine(a: SavedShippingAddress) {
  const p2 = a.address.line2?.trim()
  return [a.address.line1, p2, [a.address.city, a.address.state].filter(Boolean).join(', '), a.address.country]
    .filter(Boolean)
    .join(' · ')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="addr-modal">
      <div v-if="open" class="addr-root" role="dialog" aria-modal="true" aria-labelledby="addr-modal-title">
        <button type="button" class="addr-backdrop" aria-label="Close" @click="emit('close')" />
        <div class="addr-panel">
          <header class="addr-head">
            <h2 id="addr-modal-title" class="addr-title">Saved addresses</h2>
            <button type="button" class="addr-close" aria-label="Close" @click="emit('close')">×</button>
          </header>
          <p v-if="!addresses.length" class="addr-empty">No saved addresses yet. Fill the form and use “Save current address”.</p>
          <ul v-else class="addr-list">
            <li v-for="a in addresses" :key="a.id" class="addr-row">
              <div class="addr-body">
                <p class="addr-name">{{ a.fullName }}</p>
                <p class="addr-phone">{{ a.phone }}</p>
                <p class="addr-lines">{{ formatLine(a) }}</p>
              </div>
              <div class="addr-actions">
                <button type="button" class="addr-btn addr-btn--primary" @click="emit('select', a)">
                  Ship here
                </button>
                <button type="button" class="addr-btn addr-btn--ghost" @click="emit('remove', a.id)">
                  Remove
                </button>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.addr-root {
  position: fixed;
  inset: 0;
  z-index: 320;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
}

.addr-backdrop {
  position: absolute;
  inset: 0;
  border: none;
  margin: 0;
  padding: 0;
  background: rgba(12, 8, 6, 0.88);
  cursor: pointer;
}

.addr-panel {
  position: relative;
  z-index: 1;
  width: min(100%, 480px);
  max-height: min(80vh, 560px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: rgba(28, 19, 16, 0.98);
  border: 1px solid rgba(201, 168, 76, 0.28);
  border-radius: 12px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.45);
}

.addr-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 18px;
  border-bottom: 1px solid rgba(201, 168, 76, 0.15);
}

.addr-title {
  margin: 0;
  font-family: var(--font-sans);
  font-size: 11px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--gold);
}

.addr-close {
  width: 40px;
  height: 40px;
  border: 1px solid rgba(201, 168, 76, 0.25);
  border-radius: 8px;
  background: rgba(22, 14, 11, 0.8);
  color: var(--ivory);
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
}

.addr-empty {
  margin: 0;
  padding: 20px 18px;
  font-size: 13px;
  color: var(--muted);
  line-height: 1.6;
}

.addr-list {
  list-style: none;
  margin: 0;
  padding: 8px 0 12px;
  overflow-y: auto;
  max-height: calc(80vh - 100px);
}

.addr-row {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.addr-body {
  min-width: 0;
}

.addr-name {
  margin: 0 0 4px;
  font-weight: 600;
  color: var(--ivory);
  font-size: 14px;
}

.addr-phone,
.addr-lines {
  margin: 0;
  font-size: 12px;
  color: rgba(250, 246, 239, 0.72);
  line-height: 1.5;
}

.addr-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.addr-btn {
  font-family: var(--font-sans);
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid transparent;
}

.addr-btn--primary {
  background: var(--terra);
  color: var(--ivory);
  border-color: rgba(201, 168, 76, 0.35);
}

.addr-btn--ghost {
  background: transparent;
  color: var(--muted);
  border-color: rgba(255, 255, 255, 0.12);
}

.addr-modal-enter-active,
.addr-modal-leave-active {
  transition: opacity 0.22s ease;
}
.addr-modal-enter-from,
.addr-modal-leave-to {
  opacity: 0;
}
</style>
