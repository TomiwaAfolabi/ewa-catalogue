<!--
  SizeGuide.vue
  ─────────────────────────────────────────────────────────────────
  WCAG / HCD:
  • Uses <dl><dt><dd> — correct semantic structure for label/value pairs (WCAG 1.3.1)
  • aria-labelledby on the container ties heading to the group (WCAG 1.3.6)
  • Icons are aria-hidden; dd text carries full meaning (WCAG 1.1.1)
  • "Measured for this piece only" tooltip prevents user confusion
  • Direction icons (vertical / horizontal arrows) give immediate
    visual affordance for measurement type without extra reading
  • SHIRT / TROUSER / SHORTS cm fields from API; legacy string keys still supported
  ─────────────────────────────────────────────────────────────────
-->

<script setup lang="ts">
import { computed } from 'vue'
import type { GarmentType, ProductSizes } from '@/types'
import {
  formatMeasurementDual,
  garmentTypeLabel,
  isMeasurementPresent,
  normalizeGarmentSizes,
  resolveGarmentType,
} from '@/utils/measurements'

const props = defineProps<{
  /** Raw `sizes` JSON and/or merged `measurements` — normalized internally. */
  sizes: ProductSizes | Record<string, unknown>
  garmentType?: GarmentType | null
}>()

/** Defensive copy: detail page usually receives sizes via productService already normalized. */
const sizes = computed(() => normalizeGarmentSizes(props.sizes))

type Dir = 'v' | 'h'
type DisplayRow = { key: string; label: string; dir: Dir; value: string }

const CM_SHIRT_FIELDS: { key: keyof ProductSizes; label: string; dir: Dir }[] = [
  { key: 'chestWidthCm', label: 'Chest width', dir: 'h' },
  { key: 'sleeveLengthCm', label: 'Sleeve length', dir: 'v' },
  { key: 'shirtLengthCm', label: 'Shirt length', dir: 'v' },
]

const CM_TROUSER_FIELDS: { key: keyof ProductSizes; label: string; dir: Dir }[] = [
  { key: 'waistCm', label: 'Waist', dir: 'h' },
  { key: 'trouserLengthCm', label: 'Trouser length', dir: 'v' },
]

const CM_SHORTS_FIELDS: { key: keyof ProductSizes; label: string; dir: Dir }[] = [
  { key: 'waistCm', label: 'Waist', dir: 'h' },
  { key: 'shortsLengthCm', label: 'Shorts length', dir: 'v' },
]

const LEGACY_FIELDS: { key: keyof ProductSizes; label: string; dir: Dir }[] = [
  { key: 'length', label: 'Length', dir: 'v' },
  { key: 'shirtlength', label: 'Shirt length', dir: 'v' },
  { key: 'waist', label: 'Waist', dir: 'h' },
  { key: 'chest', label: 'Chest width', dir: 'h' },
  { key: 'thighWidth', label: 'Thigh width', dir: 'h' },
  { key: 'shoulder', label: 'Shoulder', dir: 'h' },
  { key: 'armWidth', label: 'Arm width', dir: 'h' },
  { key: 'armLength', label: 'Arm length', dir: 'v' },
]

const effectiveGarmentType = computed(() =>
  resolveGarmentType(sizes.value, props.garmentType ?? null),
)

const hasCmShirt = computed(
  () =>
    isMeasurementPresent(sizes.value.chestWidthCm) ||
    isMeasurementPresent(sizes.value.sleeveLengthCm) ||
    isMeasurementPresent(sizes.value.shirtLengthCm),
)

const hasCmTrouser = computed(
  () =>
    isMeasurementPresent(sizes.value.waistCm) ||
    isMeasurementPresent(sizes.value.trouserLengthCm),
)

const hasCmShorts = computed(
  () =>
    isMeasurementPresent(sizes.value.waistCm) ||
    isMeasurementPresent(sizes.value.shortsLengthCm) ||
    isMeasurementPresent(sizes.value.trouserLengthCm),
)

function rowsFromShortsConfig(s: ProductSizes): DisplayRow[] {
  const out: DisplayRow[] = []
  for (const c of CM_SHORTS_FIELDS) {
    let raw = s[c.key]
    if (!isMeasurementPresent(raw) && c.key === 'shortsLengthCm') {
      raw = s.trouserLengthCm
    }
    const formatted = formatMeasurementDual(raw as number | string | undefined | null)
    if (formatted) out.push({ key: String(c.key), label: c.label, dir: c.dir, value: formatted })
  }
  return out
}

function rowsFromCmConfig(
  s: ProductSizes,
  configs: { key: keyof ProductSizes; label: string; dir: Dir }[],
): DisplayRow[] {
  const out: DisplayRow[] = []
  for (const c of configs) {
    const raw = s[c.key]
    const formatted = formatMeasurementDual(raw as number | string | undefined | null)
    if (formatted) out.push({ key: String(c.key), label: c.label, dir: c.dir, value: formatted })
  }
  return out
}

const displayRows = computed((): DisplayRow[] => {
  const s = sizes.value
  if (!s || typeof s !== 'object') return []

  const mode = effectiveGarmentType.value

  if (mode === 'SHIRT') return rowsFromCmConfig(s, CM_SHIRT_FIELDS)
  if (mode === 'TROUSER') return rowsFromCmConfig(s, CM_TROUSER_FIELDS)
  if (mode === 'SHORTS') return rowsFromShortsConfig(s)

  if (hasCmShirt.value && hasCmTrouser.value) {
    return [
      ...rowsFromCmConfig(s, CM_SHIRT_FIELDS),
      ...rowsFromCmConfig(s, CM_TROUSER_FIELDS),
    ]
  }
  if (hasCmShirt.value) return rowsFromCmConfig(s, CM_SHIRT_FIELDS)
  if (hasCmShorts.value && !hasCmTrouser.value) return rowsFromShortsConfig(s)
  if (hasCmTrouser.value) return rowsFromCmConfig(s, CM_TROUSER_FIELDS)

  const legacy: DisplayRow[] = []
  for (const c of LEGACY_FIELDS) {
    const v = s[c.key]
    if (!isMeasurementPresent(v)) continue
    legacy.push({
      key: String(c.key),
      label: c.label,
      dir: c.dir,
      value:
        formatMeasurementDual(v as number | string | undefined | null) ??
        String(v).trim(),
    })
  }
  return legacy
})

const usesDualUnits = computed(() =>
  displayRows.value.some(
    (row) => row.value.includes(' cm / ') || row.value === '-',
  ),
)

const typeBadge = computed((): string | null => {
  const t = effectiveGarmentType.value
  const labeled = garmentTypeLabel(t)
  if (labeled) return labeled
  if (hasCmShirt.value && hasCmTrouser.value) return 'Shirt & trouser'
  return null
})
</script>

<template>
  <div
    class="size-guide"
    aria-labelledby="sg-heading"
    role="region"
  >
    <div class="sg-header">
      <svg class="sg-tape" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.4" width="16" height="16" aria-hidden="true">
        <rect x="1.5" y="7.5" width="19" height="7" rx="2"/>
        <line x1="5"  y1="7.5" x2="5"  y2="11"/>
        <line x1="8"  y1="7.5" x2="8"  y2="10"/>
        <line x1="11" y1="7.5" x2="11" y2="11.5"/>
        <line x1="14" y1="7.5" x2="14" y2="10"/>
        <line x1="17" y1="7.5" x2="17" y2="11"/>
      </svg>
      <h3 id="sg-heading" class="sg-title">Size Guide</h3>
      <span v-if="typeBadge" class="sg-badge sg-badge--type" :aria-label="`Garment type: ${typeBadge}`">{{ typeBadge }}</span>
      <span class="sg-badge" aria-label="Measurements are for this specific item">This item only</span>
    </div>

    <div class="sg-body">
      <p v-if="!displayRows.length" class="sg-empty">No measurements are listed for this piece yet.</p>
      <dl v-else class="sg-list">
        <div v-for="row in displayRows" :key="row.key" class="sg-entry">
          <div class="sg-dir-icon" aria-hidden="true" :title="row.dir === 'v' ? 'Vertical measurement' : 'Horizontal measurement'">
            <svg v-if="row.dir === 'v'" viewBox="0 0 14 20" fill="none" stroke="currentColor" stroke-width="1.5" width="10" height="14">
              <line x1="7" y1="2" x2="7" y2="18"/>
              <path d="M4 5l3-3 3 3"/>
              <path d="M4 15l3 3 3-3"/>
            </svg>
            <svg v-else viewBox="0 0 20 14" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="10">
              <line x1="2" y1="7" x2="18" y2="7"/>
              <path d="M5 4l-3 3 3 3"/>
              <path d="M15 4l3 3-3 3"/>
            </svg>
          </div>
          <dt class="sg-label">{{ row.label }}</dt>
          <dd class="sg-value">{{ row.value }}</dd>
        </div>
      </dl>
    </div>

    <div class="sg-footer">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" width="11" height="11" aria-hidden="true">
        <circle cx="8" cy="8" r="6.5"/>
        <path d="M8 5.5v3M8 10.5h.01"/>
      </svg>
      <p>
        All measurements refer to this piece specifically. Please check before ordering.
      
      </p>
    </div>
  </div>
</template>

<style scoped>
.size-guide {
  border: 1px solid rgba(201, 168, 76, 0.22);
  border-radius: var(--radius-md);
  overflow: hidden;
  background: rgba(22, 14, 11, 0.5);
  max-width: 100%;
  min-width: 0;
}

.sg-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 11px 16px;
  background: rgba(201, 168, 76, 0.07);
  border-bottom: 1px solid rgba(201, 168, 76, 0.16);
  min-width: 0;
}

.sg-tape { color: var(--gold); flex-shrink: 0; }

.sg-title {
  font-family: var(--font-sans);
  font-size: 10px;
  letter-spacing: 0.38em;
  text-transform: uppercase;
  color: var(--gold);
  font-weight: 500;
  flex: 1 1 8rem;
  margin: 0;
  min-width: 0;
  overflow-wrap: break-word;
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
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sg-badge--type {
  color: rgba(201, 168, 76, 0.85);
  border-color: rgba(201, 168, 76, 0.28);
  background: rgba(201, 168, 76, 0.08);
}

.sg-body {
  padding: 14px 16px;
  max-height: 210px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(201, 168, 76, 0.2) transparent;
}

.sg-empty {
  margin: 0;
  font-family: var(--font-sans);
  font-size: 12px;
  color: var(--muted);
  font-weight: 300;
  letter-spacing: 0.04em;
}

.sg-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 20px;
}

.sg-entry {
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr) minmax(0, auto);
  align-items: center;
  gap: 7px;
  padding: 6px 8px;
  border-radius: var(--radius-sm);
  transition: background 0.18s;
  min-width: 0;
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
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sg-value {
  font-family: var(--font-sans);
  font-size: 11px;
  color: var(--ivory);
  font-weight: 500;
  letter-spacing: 0.02em;
  text-align: right;
  white-space: normal;
  line-height: 1.35;
  min-width: 0;
}

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
  min-width: 0;
  overflow-wrap: break-word;
}

@media (max-width: 520px) {
  .sg-list {
    grid-template-columns: 1fr;
  }

  .sg-label,
  .sg-value {
    white-space: normal;
    overflow: visible;
    text-overflow: unset;
    text-align: left;
  }
}
</style>
