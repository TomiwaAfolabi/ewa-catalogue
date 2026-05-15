// ─────────────────────────────────────────────────────────────────────────────
// EWA Catalogue — Auth (JWT + OAuth callback tokens in localStorage)
// ─────────────────────────────────────────────────────────────────────────────
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import api from '@/services/api'
import type { AuthTokens, AuthUser } from '@/types'

const ACCESS = 'ewa_access_token'
const REFRESH = 'ewa_refresh_token'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(localStorage.getItem(ACCESS))
  const refreshToken = ref<string | null>(localStorage.getItem(REFRESH))
  const user = ref<AuthUser | null>(null)
  const loading = ref(false)

  const isLoggedIn = computed(() => Boolean(accessToken.value))

  function setTokens(tokens: AuthTokens) {
    accessToken.value = tokens.accessToken
    refreshToken.value = tokens.refreshToken
    localStorage.setItem(ACCESS, tokens.accessToken)
    localStorage.setItem(REFRESH, tokens.refreshToken)
  }

  function clearSession() {
    accessToken.value = null
    refreshToken.value = null
    user.value = null
    localStorage.removeItem(ACCESS)
    localStorage.removeItem(REFRESH)
  }

  async function fetchMe() {
    if (!accessToken.value) return
    loading.value = true
    try {
      const res = await api.auth.me()
      user.value = res.data
    } catch {
      clearSession()
    } finally {
      loading.value = false
    }
  }

  async function login(email: string, password: string) {
    const res = await api.auth.login({ email, password })
    setTokens(res.data)
    await fetchMe()
  }

  async function register(payload: {
    email: string
    password: string
    firstName?: string
    lastName?: string
  }) {
    const res = await api.auth.register(payload)
    setTokens(res.data)
    await fetchMe()
  }

  async function logout() {
    const rt = refreshToken.value
    if (rt) {
      await api.auth.logout(rt).catch(() => {})
    }
    clearSession()
  }

  function rememberOAuthRedirect(path: string) {
    sessionStorage.setItem('ewa_oauth_redirect', path)
  }

  function consumeOAuthRedirect(): string {
    const p = sessionStorage.getItem('ewa_oauth_redirect') ?? '/'
    sessionStorage.removeItem('ewa_oauth_redirect')
    return p || '/'
  }

  function applyHashTokens(access: string, refresh: string) {
    setTokens({
      accessToken: access,
      refreshToken: refresh,
      expiresIn: '',
    })
  }

  return {
    accessToken,
    refreshToken,
    user,
    loading,
    isLoggedIn,
    setTokens,
    clearSession,
    fetchMe,
    login,
    register,
    logout,
    rememberOAuthRedirect,
    consumeOAuthRedirect,
    applyHashTokens,
  }
})
