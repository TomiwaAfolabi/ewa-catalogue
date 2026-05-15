<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import api from '@/services/api'
import PasswordInput from '@/components/ui/PasswordInput.vue'
import PasswordRequirementsPanel from '@/components/auth/PasswordRequirementsPanel.vue'
import { useToast } from '@/composables/useToast'
import {
  EMAIL_MAX_LEN,
  isPasswordStrong,
  isValidEmail,
  LIMITS,
} from '@/utils/formValidation'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const email = ref('')
const code = ref('')
const password = ref('')
const confirmPassword = ref('')
const busy = ref(false)
const submitAttempted = ref(false)

onMounted(() => {
  const q = route.query.email
  if (typeof q === 'string' && q.trim()) email.value = q.trim()
})

const emailTrim = computed(() => email.value.trim())

const emailError = computed(() => {
  if (!emailTrim.value.length) {
    return submitAttempted.value ? 'Please enter your email address.' : ''
  }
  if (emailTrim.value.length > EMAIL_MAX_LEN) return 'That email looks too long. Please check it.'
  if (!isValidEmail(emailTrim.value)) return 'Enter a valid email address!'
  return ''
})

const codeError = computed(() => {
  const digits = code.value.replace(/\D/g, '')
  if (!submitAttempted.value && !code.value.length) return ''
  if (digits.length !== 6) return 'Enter the 6-digit code from your email.'
  return ''
})

const passwordFieldInvalid = computed(() => {
  const show = submitAttempted.value || password.value.length > 0
  return show && !isPasswordStrong(password.value)
})

const confirmMismatch = computed(() => {
  if (!password.value.length && !confirmPassword.value.length) return false
  if (confirmPassword.value.length > 0 && confirmPassword.value !== password.value) return true
  if (submitAttempted.value && password.value.length > 0 && confirmPassword.value !== password.value)
    return true
  return false
})

const confirmMessage = computed(() => {
  if (!confirmMismatch.value) return ''
  if (!confirmPassword.value.length && submitAttempted.value) return 'Please confirm your new password.'
  return 'Passwords do not match.'
})

async function submit() {
  submitAttempted.value = true
  if (emailError.value || codeError.value) return
  if (!isPasswordStrong(password.value)) return
  if (password.value !== confirmPassword.value) return
  if (password.value.length > LIMITS.password) {
    toast.error('Password is too long.')
    return
  }
  const digits = code.value.replace(/\D/g, '').slice(0, 6)
  if (digits.length !== 6) return

  busy.value = true
  try {
    const { data } = await api.auth.confirmPasswordReset({
      email: emailTrim.value,
      code: digits,
      password: password.value,
    })
    toast.success(data.message || 'Password updated. You can sign in now.')
    await router.replace({ name: 'login', query: route.query })
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Could not reset password.')
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <h1 class="auth-title">Reset password</h1>
      <p class="auth-lead">
        Enter the email address, the 6-digit code from your message, and your new password.
      </p>

      <form class="auth-form" @submit.prevent="submit">
        <label class="field" :class="{ 'field--invalid': emailError }">
          <span>Email</span>
          <input
            v-model="email"
            type="email"
            autocomplete="email"
            :maxlength="EMAIL_MAX_LEN"
            inputmode="email"
            :aria-invalid="emailError ? 'true' : 'false'"
          >
          <p v-if="emailError" class="field-hint field-hint--error" role="alert">{{ emailError }}</p>
        </label>

        <label class="field" :class="{ 'field--invalid': codeError }">
          <span>Verification code</span>
          <input
            v-model="code"
            type="text"
            inputmode="numeric"
            autocomplete="one-time-code"
            maxlength="8"
            placeholder="000000"
            :aria-invalid="codeError ? 'true' : 'false'"
          >
          <p v-if="codeError" class="field-hint field-hint--error" role="alert">{{ codeError }}</p>
        </label>

        <label class="field" :class="{ 'field--invalid': passwordFieldInvalid }">
          <span>New password</span>
          <PasswordInput
            v-model="password"
            autocomplete="new-password"
            :maxlength="LIMITS.password"
            :aria-invalid="passwordFieldInvalid ? 'true' : 'false'"
            :invalid="passwordFieldInvalid"
          />
        </label>

        <label class="field" :class="{ 'field--invalid': confirmMismatch }">
          <span>Confirm new password</span>
          <PasswordInput
            v-model="confirmPassword"
            autocomplete="new-password"
            :maxlength="LIMITS.password"
            :aria-invalid="confirmMismatch ? 'true' : 'false'"
            :invalid="confirmMismatch"
          />
          <p v-if="confirmMessage" class="field-hint field-hint--error" role="alert">{{ confirmMessage }}</p>
        </label>

        <PasswordRequirementsPanel :password="password" />

        <button type="submit" class="btn-primary" :disabled="busy">
          {{ busy ? 'Updating…' : 'Update password' }}
        </button>
      </form>

      <p class="auth-footer">
        <RouterLink :to="{ name: 'forgot-password', query: route.query }" class="link">Request a new code</RouterLink>
        ·
        <RouterLink :to="{ name: 'login', query: route.query }" class="link">Sign in</RouterLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: calc(100vh - 72px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: rgba(28, 19, 16, 0.35);
}

.auth-card {
  width: 100%;
  max-width: 460px;
  background: #faf6ef;
  padding: 36px 32px 40px;
  border-radius: 12px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.12);
}

.auth-title {
  margin: 0 0 8px;
  font-family: var(--font-serif);
  font-weight: 400;
  font-size: 1.75rem;
  color: #2c1810;
}

.auth-lead {
  margin: 0 0 28px;
  font-size: 0.9rem;
  line-height: 1.5;
  color: #5c4033;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #5c4033;
}

.field--invalid {
  color: #b42318;
}

.field--invalid input {
  border-color: #c94a3d !important;
}

.field--invalid :deep(.password-wrap--invalid) {
  border-color: #c94a3d;
}

.field input {
  padding: 12px 14px;
  border: 1px solid rgba(44, 24, 16, 0.2);
  border-radius: 6px;
  font-size: 1rem;
  background: #fff;
}

.field input:focus {
  outline: 2px solid var(--terra);
  outline-offset: 1px;
}

.field-hint {
  margin: 0;
  font-size: 0.8rem;
  letter-spacing: normal;
  text-transform: none;
  line-height: 1.35;
}

.field-hint--error {
  color: #b42318;
}

.btn-primary {
  margin-top: 4px;
  padding: 14px;
  border: none;
  border-radius: var(--radius-sm);
  background: var(--terra);
  color: var(--ivory);
  font-size: 0.75rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  cursor: pointer;
}
.btn-primary:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.auth-footer {
  margin: 28px 0 0;
  text-align: center;
  font-size: 0.9rem;
  color: #5c4033;
  line-height: 1.6;
}

.link {
  color: var(--terra);
  font-weight: 600;
}
</style>
