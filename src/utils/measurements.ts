// ─────────────────────────────────────────────
// Garment measurements — API sends cm as numbers
// or strings; optional fields merge into JSON.
// ─────────────────────────────────────────────

import type { GarmentType, ProductSizes } from '@/types'

export function isMeasurementPresent(value: unknown): boolean {
  if (value === undefined || value === null) return false
  if (typeof value === 'number') return Number.isFinite(value)
  if (typeof value === 'string') return value.trim().length > 0
  return false
}

/** Display value with cm suffix for numeric garment fields. */
export function formatCm(value: number | string | undefined | null): string | null {
  if (!isMeasurementPresent(value)) return null
  if (typeof value === 'number' && Number.isFinite(value)) return `${value} cm`
  const s = String(value).trim()
  const n = Number(s)
  if (Number.isFinite(n) && s !== '' && !/[a-z]/i.test(s)) return `${n} cm`
  return s
}

export function normalizeGarmentType(value: unknown): GarmentType | null {
  if (value === 'SHIRT' || value === 'TROUSER') return value
  if (typeof value === 'string') {
    const u = value.trim().toUpperCase()
    if (u === 'SHIRT' || u === 'TROUSER') return u as GarmentType
  }
  return null
}

/** Prefer explicit product / sizes garmentType; else infer from which cm fields exist. */
export function resolveGarmentType(
  sizes: ProductSizes | undefined | null,
  productGarmentType?: GarmentType | null,
): GarmentType | null {
  function hasShirtCm(s: ProductSizes | undefined | null): boolean {
    if (!s) return false
    return (
      isMeasurementPresent(s.chestWidthCm) ||
      isMeasurementPresent(s.sleeveLengthCm) ||
      isMeasurementPresent(s.shirtLengthCm)
    )
  }

  function hasTrouserCm(s: ProductSizes | undefined | null): boolean {
    if (!s) return false
    return isMeasurementPresent(s.waistCm) || isMeasurementPresent(s.trouserLengthCm)
  }

  const explicit =
    normalizeGarmentType(productGarmentType) ??
    normalizeGarmentType(sizes?.garmentType)

  let inferred: GarmentType | null = null
  if (sizes) {
    const hs = hasShirtCm(sizes)
    const ht = hasTrouserCm(sizes)
    if (hs && !ht) inferred = 'SHIRT'
    else if (ht && !hs) inferred = 'TROUSER'
  }

  if (explicit && inferred && explicit !== inferred) {
    const explicitMatchesData =
      explicit === 'SHIRT' ? hasShirtCm(sizes) : hasTrouserCm(sizes)
    if (!explicitMatchesData) return inferred
  }

  if (explicit) return explicit
  return inferred
}

/**
 * APIs often put cm fields on `measurements` while `sizes` is empty or legacy-only.
 * Merges `measurement` / `measurements` with `sizes` (sizes wins on key clash).
 */
export function extractProductSizesInput(product: unknown): Record<string, unknown> {
  if (!product || typeof product !== 'object') return {}
  const r = product as Record<string, unknown>
  const part = (x: unknown): Record<string, unknown> =>
    x && typeof x === 'object' && !Array.isArray(x) ? { ...(x as Record<string, unknown>) } : {}
  const fromSizes = part(r.sizes)
  const fromMs = part(r.measurements ?? r.measurement)
  const merged = { ...fromMs, ...fromSizes }
  return Object.keys(merged).length ? merged : {}
}

function parseSizesObject(raw: unknown): Record<string, unknown> | null {
  if (raw == null) return null
  let obj: Record<string, unknown> | null = null
  if (typeof raw === 'string') {
    const t = raw.trim()
    if (!t) return null
    try {
      const j = JSON.parse(t) as unknown
      if (typeof j === 'object' && j != null && !Array.isArray(j)) obj = j as Record<string, unknown>
    } catch {
      return null
    }
  } else if (typeof raw === 'object' && !Array.isArray(raw)) {
    obj = { ...(raw as Record<string, unknown>) }
  }
  if (!obj) return null
  const inner = obj.measurements ?? obj.measurement
  if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
    return { ...(inner as Record<string, unknown>), ...obj }
  }
  return obj
}

function lowerKeyMap(obj: Record<string, unknown>): Map<string, unknown> {
  const m = new Map<string, unknown>()
  for (const [k, v] of Object.entries(obj)) {
    m.set(k.toLowerCase(), v)
  }
  return m
}

function pickFromMap(map: Map<string, unknown>, keys: string[]): unknown {
  for (const key of keys) {
    const v = map.get(key.toLowerCase())
    if (isMeasurementPresent(v)) return v
  }
  return undefined
}

/**
 * Coerce catalogue `sizes` JSON into the camelCase *Cm shape the UI expects.
 * Handles snake_case keys, legacy field names, stringified JSON, and nested `measurements`.
 */
export function normalizeGarmentSizes(raw: unknown): ProductSizes {
  const obj = parseSizesObject(raw)
  if (!obj) return {}

  const map = lowerKeyMap(obj)
  const merged: ProductSizes = {}

  const gtRaw = pickFromMap(map, ['garmentType', 'garment_type'])
  if (gtRaw !== undefined && gtRaw !== null && String(gtRaw).trim()) {
    const n = normalizeGarmentType(gtRaw)
    if (n) merged.garmentType = n
    else merged.garmentType = String(gtRaw).trim()
  }

  const setCm = (field: keyof ProductSizes, keys: string[]) => {
    const v = pickFromMap(map, keys)
    if (isMeasurementPresent(v)) (merged as Record<string, unknown>)[field as string] = v
  }

  setCm('chestWidthCm', ['chestWidthCm', 'chest_width_cm', 'chestWidth', 'chest_width'])
  if (!isMeasurementPresent(merged.chestWidthCm)) {
    const v = pickFromMap(map, ['chest'])
    if (isMeasurementPresent(v)) merged.chestWidthCm = v as number | string
  }

  setCm('sleeveLengthCm', [
    'sleeveLengthCm',
    'sleeve_length_cm',
    'sleeveLength',
    'sleeve_length',
    'sleeve',
  ])
  if (!isMeasurementPresent(merged.sleeveLengthCm)) {
    const v = pickFromMap(map, ['armLength', 'arm_length'])
    if (isMeasurementPresent(v)) merged.sleeveLengthCm = v as number | string
  }

  setCm('shirtLengthCm', [
    'shirtLengthCm',
    'shirt_length_cm',
    'shirtLength',
    'shirt_length',
    'bodyLength',
    'body_length_cm',
  ])
  if (!isMeasurementPresent(merged.shirtLengthCm)) {
    const v = pickFromMap(map, ['shirtlength'])
    if (isMeasurementPresent(v)) merged.shirtLengthCm = v as number | string
  }

  setCm('waistCm', ['waistCm', 'waist_cm', 'waistSize', 'waist_size_cm'])
  if (!isMeasurementPresent(merged.waistCm)) {
    const v = pickFromMap(map, ['waist'])
    if (isMeasurementPresent(v)) merged.waistCm = v as number | string
  }

  setCm('trouserLengthCm', [
    'trouserLengthCm',
    'trouser_length_cm',
    'trouserLength',
    'trouser_length',
    'outseamCm',
    'outseam_cm',
    'inseamCm',
    'inseam_cm',
    'legLength',
    'leg_length_cm',
  ])

  for (const lk of ['chest', 'armLength', 'waist', 'shirtlength'] as const) {
    const v = pickFromMap(map, [lk])
    if (!isMeasurementPresent(v)) continue
    const promoted =
      lk === 'chest'
        ? merged.chestWidthCm
        : lk === 'armLength'
          ? merged.sleeveLengthCm
          : lk === 'waist'
            ? merged.waistCm
            : merged.shirtLengthCm
    if (isMeasurementPresent(promoted)) continue
    ;(merged as Record<string, unknown>)[lk] =
      typeof v === 'number' ? String(v) : String(v).trim()
  }

  for (const lk of ['thighWidth', 'shoulder', 'armWidth'] as const) {
    const v = pickFromMap(map, [lk])
    if (!isMeasurementPresent(v)) continue
    ;(merged as Record<string, unknown>)[lk] =
      typeof v === 'number' ? String(v) : String(v).trim()
  }

  const lenVal = pickFromMap(map, ['length'])
  if (isMeasurementPresent(lenVal)) {
    const gt = normalizeGarmentType(merged.garmentType) ?? resolveGarmentType(merged, null)

    let consumed = false
    const shirtSignals =
      isMeasurementPresent(merged.chestWidthCm) ||
      isMeasurementPresent(merged.sleeveLengthCm) ||
      isMeasurementPresent(merged.shirtLengthCm)

    if (
      !isMeasurementPresent(merged.trouserLengthCm) &&
      (gt === 'TROUSER' ||
        (!shirtSignals && isMeasurementPresent(merged.waistCm)))
    ) {
      merged.trouserLengthCm = lenVal as number | string
      consumed = true
    } else if (!isMeasurementPresent(merged.shirtLengthCm) && gt === 'SHIRT') {
      merged.shirtLengthCm = lenVal as number | string
      consumed = true
    }

    if (!consumed) {
      merged.length = typeof lenVal === 'number' ? String(lenVal) : String(lenVal).trim()
    }
  }

  return merged
}

const SIZE_META_KEYS = new Set(['garmentType'])

export function countMeasurementFields(sizes: ProductSizes | undefined | null): number {
  if (!sizes || typeof sizes !== 'object') return 0
  let n = 0
  for (const [key, value] of Object.entries(sizes)) {
    if (SIZE_META_KEYS.has(key)) continue
    if (isMeasurementPresent(value)) n++
  }
  return n
}
