<script setup lang="ts">
import type { ProductSizes } from '@/types'

defineProps<{ sizes: ProductSizes }>()

const sizeLabels: Record<keyof ProductSizes, string> = {
  length:      'Length',
  waist:       'Waist',
  shirtlength: 'Shirt Length',
  thighWidth:  'Thigh Width',
  shoulder:    'Shoulder',
  chest:       'Chest Width',
  armWidth:    'Arm Width',
  armLength:   'Arm Length',
}
</script>

<template>
  <div class="size-guide">
    <div class="size-header">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M2 12h20M2 12l4-4m-4 4 4 4M22 12l-4-4m4 4-4 4"/>
      </svg>
      <span>Size Guide</span>
    </div>
    <div class="size-body">
      <div class="size-grid">
        <template v-for="(label, key) in sizeLabels" :key="key">
          <div v-if="sizes[key]" class="size-row">
            <span class="size-label">{{ label }}</span>
            <span class="size-value">{{ sizes[key] }}</span>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.size-guide {
  border: 1px solid rgba(201, 168, 76, 0.25);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.size-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(201, 168, 76, 0.08);
  border-bottom: 1px solid rgba(201, 168, 76, 0.2);
  font-size: 11px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--gold);
  font-weight: 500;
}

.size-body {
  padding: 16px;
  max-height: 180px;
  overflow-y: auto;
}

.size-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 24px;
}

.size-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.size-label {
  font-size: 10px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--muted);
  font-weight: 300;
}

.size-value {
  font-size: 14px;
  color: var(--ivory);
  font-weight: 400;
  letter-spacing: 0.02em;
}
</style>
