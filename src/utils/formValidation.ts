/** Practical max length for RFC-style email local+domain (not full spec). */
export const EMAIL_MAX_LEN = 320

/** HTML / text field limits aligned with server DTOs where applicable */
export const LIMITS = {
  fullName: 200,
  phone: 40,
  addressLine: 500,
  city: 120,
  state: 120,
  postalCode: 32,
  country: 80,
  orderNotes: 2000,
  firstName: 100,
  lastName: 100,
  password: 256,
} as const

const EMAIL_RE =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(value: string): boolean {
  const t = value.trim()
  if (!t || t.length > EMAIL_MAX_LEN) return false
  return EMAIL_RE.test(t)
}

export function containsHtmlDelimiters(value: string): boolean {
  return /[<>]/.test(value)
}

/** Aligned with server `RegisterDto` */
export const PASSWORD_MIN_LEN = 12

export type PasswordRuleStatus = {
  id: string
  label: string
  met: boolean
}

const PASSWORD_RULE_DEFS = [
  {
    id: 'length',
    label: `At least ${PASSWORD_MIN_LEN} characters`,
    test: (pw: string) => pw.length >= PASSWORD_MIN_LEN,
  },
  {
    id: 'upper',
    label: 'At least one uppercase letter',
    test: (pw: string) => /[A-Z]/.test(pw),
  },
  {
    id: 'lower',
    label: 'At least one lowercase letter',
    test: (pw: string) => /[a-z]/.test(pw),
  },
  {
    id: 'number',
    label: 'At least one number',
    test: (pw: string) => /\d/.test(pw),
  },
  {
    id: 'special',
    label: 'At least one special character',
    test: (pw: string) => /[^A-Za-z0-9]/.test(pw),
  },
] as const

export function evaluatePasswordRules(password: string): PasswordRuleStatus[] {
  return PASSWORD_RULE_DEFS.map(({ id, label, test }) => ({
    id,
    label,
    met: test(password),
  }))
}

export function isPasswordStrong(password: string): boolean {
  return PASSWORD_RULE_DEFS.every((r) => r.test(password))
}
