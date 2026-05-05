<!--
  SizeGuide.vue
  ─────────────────────────────────────────────────────────────────
  WCAG / HCD:
  • Uses <dl><dt><dd> — correct semantic structure for label/value pairs (WCAG 1.3.1)
  • aria-labelledby on the container ties heading to the group (WCAG 1.3.6)
  • Icons are aria-hidden; dd text carries full meaning (WCAG 1.1.1)
  • "Measured for this piece only" tooltip prevents user confusion
    (Nielsen #6 — Recognition over recall, error prevention)
  • Direction icons (vertical / horizontal arrows) give immediate
    visual affordance for measurement type without extra reading
  ─────────────────────────────────────────────────────────────────
-->

<script setup lang="ts">
import type { ProductSizes } from '@/types'

defineProps<{ sizes: ProductSizes }>()

// Each measurement maps to a direction icon and plain label
const sizeConfig: {
  key: keyof ProductSizes
  label: string
  dir: 'v' | 'h'          // vertical or horizontal measurement
  unit: string
}[] = [
  { key: 'length',      label: 'Length',       dir: 'v', unit: '' },
  { key: 'shirtlength', label: 'Shirt Length',  dir: 'v', unit: '' },
  { key: 'waist',       label: 'Waist',         dir: 'h', unit: '' },
  { key: 'chest',       label: 'Chest Width',   dir: 'h', unit: '' },
  { key: 'thighWidth',  label: 'Thigh Width',   dir: 'h', unit: '' },
  { key: 'shoulder',    label: 'Shoulder',      dir: 'h', unit: '' },
  { key: 'armWidth',    label: 'Arm Width',     dir: 'h', unit: '' },
  { key: 'armLength',   label: 'Arm Length',    dir: 'v', unit: '' },
]
</script>

<template>
  <div
    class="size-guide"
    aria-labelledby="sg-heading"
    role="region"
  >
    <!-- Header -->
    <div class="sg-header">
      <!-- Tape measure icon -->
      <svg class="sg-tape" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.4" width="16" height="16" aria-hidden="true">
        <rect x="1.5" y="7.5" width="19" height="7" rx="2"/>
        <line x1="5"  y1="7.5" x2="5"  y2="11"/>
        <line x1="8"  y1="7.5" x2="8"  y2="10"/>
        <line x1="11" y1="7.5" x2="11" y2="11.5"/>
        <line x1="14" y1="7.5" x2="14" y2="10"/>
        <line x1="17" y1="7.5" x2="17" y2="11"/>
      </svg>
      <h3 id="sg-heading" class="sg-title">Size Guide</h3>
      <span class="sg-badge" aria-label="Measurements are for this specific item">This item only</span>
    </div>

    <!-- Measurement list -->
    <div class="sg-body">
      <dl class="sg-list">
        <template v-for="cfg in sizeConfig" :key="cfg.key">
          <div v-if="sizes[cfg.key]" class="sg-entry">

            <!-- Direction icon -->
            <div class="sg-dir-icon" aria-hidden="true" :title="cfg.dir === 'v' ? 'Vertical measurement' : 'Horizontal measurement'">
              <!-- Vertical arrow (↕) -->
              <svg v-if="cfg.dir === 'v'" viewBox="0 0 14 20" fill="none" stroke="currentColor" stroke-width="1.5" width="10" height="14">
                <line x1="7" y1="2" x2="7" y2="18"/>
                <path d="M4 5l3-3 3 3"/>
                <path d="M4 15l3 3 3-3"/>
              </svg>
              <!-- Horizontal arrow (↔) -->
              <svg v-else viewBox="0 0 20 14" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="10">
                <line x1="2" y1="7" x2="18" y2="7"/>
                <path d="M5 4l-3 3 3 3"/>
                <path d="M15 4l3 3-3 3"/>
              </svg>
            </div>

            <dt class="sg-label">{{ cfg.label }}</dt>
            <dd class="sg-value">{{ sizes[cfg.key] }}</dd>
          </div>
        </template>
      </dl>
    </div>

    <!-- Footer note -->
    <div class="sg-footer">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" width="11" height="11" aria-hidden="true">
        <circle cx="8" cy="8" r="6.5"/>
        <path d="M8 5.5v3M8 10.5h.01"/>
      </svg>
      <p>All measurements refer to this piece specifically. Please check before ordering.</p>
    </div>
  </div>
</template>

<style scoped>
.size-guide {
  border: 1px solid rgba(201, 168, 76, 0.22);
  border-radius: var(--radius-md);
  overflow: hidden;
  background: rgba(22, 14, 11, 0.5);
}

/* ── Header ────────────────────────── */
.sg-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 11px 16px;
  background: rgba(201, 168, 76, 0.07);
  border-bottom: 1px solid rgba(201, 168, 76, 0.16);
}

.sg-tape { color: var(--gold); flex-shrink: 0; }

.sg-title {
  font-family: var(--font-sans);
  font-size: 10px;
  letter-spacing: 0.38em;
  text-transform: uppercase;
  color: var(--gold);
  font-weight: 500;
  flex: 1;
  margin: 0;
}

.sg-badge {
  font-family: var(--font-sans);
  font-size: 9px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: rgba(139, 115, 85, 0.6);
  background: rgba(139, 115, 85, 0.08);
  padding: 2px 8px;
  border-radius: 99px;
  border: 1px solid rgba(139, 115, 85, 0.15);
  white-space: nowrap;
}

/* ── Body ──────────────────────────── */
.sg-body {
  padding: 14px 16px;
  max-height: 210px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(201, 168, 76, 0.2) transparent;
}

.sg-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 20px;
}

.sg-entry {
  display: grid;
  grid-template-columns: 18px 1fr auto;
  align-items: center;
  gap: 7px;
  padding: 6px 8px;
  border-radius: var(--radius-sm);
  transition: background 0.18s;
}
.sg-entry:hover { background: rgba(201, 168, 76, 0.05); }

.sg-dir-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(181, 82, 42, 0.55);
  flex-shrink: 0;
}

.sg-label {
  font-family: var(--font-sans);
  font-size: 10px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--muted);
  font-weight: 300;
  white-space: nowrap;
}

.sg-value {
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--ivory);
  font-weight: 500;
  letter-spacing: 0.04em;
  text-align: right;
  white-space: nowrap;
}

/* ── Footer note ───────────────────── */
.sg-footer {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 16px;
  border-top: 1px solid rgba(201, 168, 76, 0.10);
  background: rgba(201, 168, 76, 0.03);
}

.sg-footer svg { color: var(--gold); flex-shrink: 0; margin-top: 1px; }

.sg-footer p {
  font-family: var(--font-sans);
  font-size: 10px;
  line-height: 1.65;
  color: rgba(139, 115, 85, 0.65);
  letter-spacing: 0.03em;
  font-weight: 300;
}
</style>
