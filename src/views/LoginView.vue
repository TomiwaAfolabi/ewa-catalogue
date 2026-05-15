<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { BASE_URL } from '@/services/api'
import { useToast } from '@/composables/useToast'
import PasswordInput from '@/components/ui/PasswordInput.vue'
import { EMAIL_MAX_LEN, isValidEmail, LIMITS } from '@/utils/formValidation'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const toast = useToast()

const email = ref('')
const password = ref('')
const busy = ref(false)
const submitAttempted = ref(false)

const emailTrim = computed(() => email.value.trim())

const emailError = computed(() => {
  if (!emailTrim.value.length) {
    return submitAttempted.value ? 'Please enter your email address.' : ''
  }
  if (emailTrim.value.length > EMAIL_MAX_LEN) return 'That email looks too long. Please check it.'
  if (!isValidEmail(emailTrim.value)) return 'Enter a valid email address!'
  return ''
})

const passwordTooLongError = computed(() =>
  password.value.length > LIMITS.password
    ? 'Password is too long. If you did not paste it by mistake, contact support.'
    : '',
)

function friendlyLoginError(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('invalid credential')) {
    return 'Incorrect email or password. Please try again.'
  }
  if (m.includes('timed out')) return message
  if (m.includes('sign in again')) return message
  return message
}

async function submit() {
  submitAttempted.value = true
  const em = emailTrim.value
  if (!em) return
  if (em.length > EMAIL_MAX_LEN) return
  if (!isValidEmail(em)) return
  if (!password.value) return
  if (password.value.length > LIMITS.password) return
  busy.value = true
  try {
    await auth.login(em, password.value)
    toast.success('Signed in successfully.')
    await router.replace({ name: 'home' })
  } catch (e) {
    const raw = e instanceof Error ? e.message : 'Sign in failed.'
    toast.error(friendlyLoginError(raw))
  } finally {
    busy.value = false
  }
}

function googleSignIn() {
  auth.rememberOAuthRedirect('/')
  window.location.href = `${BASE_URL}/v1/auth/google`
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <h1 class="auth-title">Sign in</h1>
      <p class="auth-lead">Welcome back. Sign in to add to cart and pay with Paystack.</p>

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
        <label
          class="field"
          :class="{ 'field--invalid': (submitAttempted && !password.length) || Boolean(passwordTooLongError) }"
        >
          <span class="password-label-row">
            <span>Password</span>
            <RouterLink :to="{ name: 'forgot-password', query: route.query }" class="link-forgot" tabindex="-1">
              Forgot password?
            </RouterLink>
          </span>
          <PasswordInput
            v-model="password"
            autocomplete="current-password"
            :maxlength="LIMITS.password"
            :aria-invalid="(submitAttempted && !password.length) || Boolean(passwordTooLongError) ? 'true' : 'false'"
            :invalid="Boolean((submitAttempted && !password.length) || passwordTooLongError)"
          />
          <p v-if="submitAttempted && !password.length" class="field-hint field-hint--error" role="alert">
            Please enter your password.
          </p>
          <p v-else-if="passwordTooLongError" class="field-hint field-hint--error" role="alert">
            {{ passwordTooLongError }}
          </p>
        </label>
        <button type="submit" class="btn-primary" :disabled="busy">
          {{ busy ? 'Signing in…' : 'Sign in' }}
        </button>
      </form>

      <div class="divider">
        <span>or</span>
      </div>

      <button type="button" class="btn-oauth" @click="googleSignIn">
        <svg class="oauth-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </button>

      <p class="auth-footer">
        No account?
        <RouterLink :to="{ name: 'register', query: route.query }" class="link">Create one</RouterLink>
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
  max-width: 420px;
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

.password-label-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  letter-spacing: 0.12em;
}

.link-forgot {
  font-size: 0.62rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--terra);
  font-weight: 600;
  text-decoration: none;
}

.link-forgot:hover {
  text-decoration: underline;
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

.divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 24px 0;
  color: #8a7266;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
}
.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgba(44, 24, 16, 0.12);
}

.btn-oauth {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 16px;
  border: 1px solid rgba(44, 24, 16, 0.18);
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  font-size: 0.9rem;
  color: #2c1810;
}
.btn-oauth:focus-visible {
  outline: 2px solid var(--terra);
  outline-offset: 2px;
}

.oauth-icon {
  width: 20px;
  height: 20px;
}

.auth-footer {
  margin: 28px 0 0;
  text-align: center;
  font-size: 0.9rem;
  color: #5c4033;
}

.link {
  color: var(--terra);
  font-weight: 600;
}
</style>
