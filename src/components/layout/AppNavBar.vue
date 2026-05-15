<!--
  AppNavBar.vue
  ─────────────────────────────────────────────────────────────────
  WCAG / HCD:
  • <nav> with aria-label="Main navigation" (WCAG 4.1.2 landmark)
  • aria-current="page" on active link (WCAG 4.1.2 + screen reader UX)
  • aria-expanded on hamburger (WCAG 4.1.2)
  • aria-label on cart button describes count when items present (WCAG 4.1.2)
  • Focus ring on all interactive elements (WCAG 2.4.7)
  • Logo button aria-label is descriptive, not "logo" (WCAG 2.4.6)
  • Mobile menu is keyboard navigable (WCAG 2.1.1)
  • Icons are aria-hidden; text labels carry semantic meaning (WCAG 1.1.1)
  ─────────────────────────────────────────────────────────────────
-->

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCartStore } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/authStore'

const router    = useRouter()
const route     = useRoute()
const cartStore = useCartStore()
const authStore = useAuthStore()

const mobileOpen = ref(false)
const userMenuOpen = ref(false)

const avatarLabel = computed(() => {
  const u = authStore.user
  if (!u) return 'Account'
  const n = [u.firstName, u.lastName].filter(Boolean).join(' ')
  return n || u.email
})

const initials = computed(() => {
  const u = authStore.user
  if (!u) return '?'
  const f = u.firstName?.trim() ?? ''
  const l = u.lastName?.trim() ?? ''
  const fc = f.charAt(0)
  const lc = l.charAt(0)
  if (fc && lc) return `${fc}${lc}`.toUpperCase()
  if (f.length >= 2) return f.slice(0, 2).toUpperCase()
  if (fc) return `${fc}${f.charAt(1) || fc}`.toUpperCase()
  return u.email.slice(0, 2).toUpperCase()
})

async function logout() {
  userMenuOpen.value = false
  mobileOpen.value = false
  await authStore.logout()
  if (route.name === 'checkout' || route.name === 'profile') {
    void router.push({ name: 'home' })
  }
}

function toggleUserMenu() {
  userMenuOpen.value = !userMenuOpen.value
}

watch(
  () => route.fullPath,
  () => {
    userMenuOpen.value = false
  },
)

const navLinks = [
  { label: 'Home', name: 'home', path: '/' },
  { label: 'About', name: 'about', path: '/about' },
  { label: 'Shop', name: 'catalogue', path: '/catalogue' },
]

// Slightly broader active check — also catches /catalogue/:id
const isActive = (path: string) =>
  path === '/'
    ? route.path === '/'
    : route.path.startsWith(path)

function navigate(name: string) {
  mobileOpen.value = false
  router.push({ name })
}

function toggleMobile() {
  mobileOpen.value = !mobileOpen.value
}
</script>

<template>
  <nav
    class="ewa-nav"
    :class="{ 'ewa-nav--open': mobileOpen }"
    role="navigation"
    aria-label="Main navigation"
  >
    <div class="nav-inner">

      <!-- ── Logo ─────────────────────────────────── -->
      <button
        class="nav-logo"
        @click="navigate('home')"
        aria-label="EWA — return to home page"
      >
        <div class="logo-mark" aria-hidden="true">
          <!-- Geometric lily / brand emblem -->
          <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <ellipse cx="18" cy="9"  rx="4.5" ry="7.5" fill="rgba(201,168,76,0.55)"/>
            <ellipse cx="18" cy="9"  rx="4.5" ry="7.5" fill="rgba(201,168,76,0.55)" transform="rotate(60 18 18)"/>
            <ellipse cx="18" cy="9"  rx="4.5" ry="7.5" fill="rgba(201,168,76,0.55)" transform="rotate(120 18 18)"/>
            <ellipse cx="18" cy="9"  rx="4.5" ry="7.5" fill="rgba(201,168,76,0.55)" transform="rotate(180 18 18)"/>
            <ellipse cx="18" cy="9"  rx="4.5" ry="7.5" fill="rgba(201,168,76,0.55)" transform="rotate(240 18 18)"/>
            <ellipse cx="18" cy="9"  rx="4.5" ry="7.5" fill="rgba(201,168,76,0.55)" transform="rotate(300 18 18)"/>
            <circle  cx="18" cy="18" r="5"   fill="#B5522A"/>
            <circle  cx="18" cy="18" r="2.5" fill="#C9A84C"/>
          </svg>
        </div>
        <div class="logo-text">
          <span class="logo-wordmark" aria-hidden="true">EWA</span>
          <span class="logo-tagline"  aria-hidden="true">Born of Beauty · Rooted in Heritage</span>
        </div>
      </button>

      <!-- ── Desktop links ─────────────────────────── -->
      <div class="nav-links" role="list">
        <div role="listitem" v-for="link in navLinks" :key="link.name">
          <button
            class="nav-link"
            :class="{ 'nav-link--active': isActive(link.path) }"
            :aria-current="isActive(link.path) ? 'page' : undefined"
            @click="navigate(link.name)"
          >
            <!-- Home icon -->
            <svg v-if="link.name === 'home'" class="nav-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
              <path d="M3 9.5L10 3l7 6.5V17a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/>
              <path d="M7 18v-7h6v7"/>
            </svg>
            <!-- About icon -->
            <svg v-else-if="link.name === 'about'" class="nav-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
              <circle cx="10" cy="10" r="7"/>
              <path d="M10 8v5M10 6h.01"/>
            </svg>
            <!-- Shop / shopping bag icon -->
            <svg v-else-if="link.name === 'catalogue'" class="nav-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
              <path d="M4 4h12l1.5 10a1 1 0 0 1-1 1.1H3.5a1 1 0 0 1-1-1.1z"/>
              <path d="M7.5 7A2.5 2.5 0 0 1 12.5 7"/>
            </svg>
            <span class="nav-link-label">{{ link.label }}</span>
            <!-- Active indicator pill -->
            <span v-if="isActive(link.path)" class="active-pip" aria-hidden="true" />
          </button>
        </div>
      </div>

      <!-- ── Right actions (cart left of avatar when signed in) ───────────── -->
      <div class="nav-actions">
        <div v-if="!authStore.isLoggedIn" class="auth-links desktop-only">
          <RouterLink class="auth-link" :to="{ name: 'login', query: { redirect: route.fullPath } }">
            Sign in
          </RouterLink>
          <RouterLink class="auth-link auth-link--emph" :to="{ name: 'register' }">
            Register
          </RouterLink>
        </div>

        <!-- Cart button -->
        <button
          class="cart-btn"
          @click="cartStore.toggleCart()"
          :aria-label="cartStore.totalItems > 0
            ? `Open cart — ${cartStore.totalItems} ${cartStore.totalItems === 1 ? 'item' : 'items'}`
            : 'Open cart'"
        >
          <!-- Bag icon -->
          <svg class="cart-icon" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
            <path d="M5 3L3 7v12a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 19 19V7L17 3z"/>
            <line x1="3" y1="7" x2="19" y2="7"/>
            <path d="M14.5 10a3.5 3.5 0 0 1-7 0"/>
          </svg>

          <!-- Animated badge — pops in when items are added -->
          <Transition name="badge">
            <span
              v-if="cartStore.totalItems > 0"
              class="cart-badge"
              aria-hidden="true"
            >
              {{ cartStore.totalItems > 9 ? '9+' : cartStore.totalItems }}
            </span>
          </Transition>
        </button>

        <!-- Avatar immediately to the right of the cart (desktop) -->
        <div v-if="authStore.isLoggedIn" class="user-wrap desktop-only">
          <button
            type="button"
            class="avatar-btn"
            :aria-expanded="userMenuOpen"
            :aria-label="`Account menu for ${avatarLabel}`"
            @click="toggleUserMenu"
          >
            <img
              v-if="authStore.user?.avatarUrl"
              :src="authStore.user.avatarUrl"
              alt=""
              class="avatar-img"
              width="36"
              height="36"
              referrerpolicy="no-referrer"
            >
            <span v-else class="avatar-fallback" aria-hidden="true">{{ initials }}</span>
          </button>
          <Transition name="fade">
            <div v-if="userMenuOpen" class="user-dd" role="menu">
              <p class="user-dd-email">{{ authStore.user?.email }}</p>
              <button
                type="button"
                class="user-dd-item"
                role="menuitem"
                @click="userMenuOpen = false; router.push({ name: 'profile' })"
              >
                <svg class="user-dd-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                  <path d="M7 3.5h6a1 1 0 0 1 1 1V17a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z"/>
                  <path d="M5 6.5h10M8 9.5h6M8 12.5h4"/>
                </svg>
                <span>Orders &amp; profile</span>
              </button>
              <button type="button" class="user-dd-item" role="menuitem" @click="logout">
                <svg class="user-dd-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                  <path d="M7 17H4.5A1.5 1.5 0 0 1 3 15.5v-11A1.5 1.5 0 0 1 4.5 3H7"/>
                  <path d="M13 14l4-4-4-4M8 10h8"/>
                </svg>
                <span>Sign out</span>
              </button>
            </div>
          </Transition>
        </div>

        <!-- Mobile hamburger — animated to × when open -->
        <button
          class="hamburger"
          @click="toggleMobile"
          :aria-expanded="mobileOpen"
          :aria-label="mobileOpen ? 'Close navigation menu' : 'Open navigation menu'"
        >
          <span
            class="ham-bar"
            :style="mobileOpen
              ? 'transform: translateY(6.5px) rotate(45deg)'
              : ''"
          />
          <span
            class="ham-bar"
            :style="mobileOpen
              ? 'opacity: 0; transform: scaleX(0.3)'
              : ''"
          />
          <span
            class="ham-bar"
            :style="mobileOpen
              ? 'transform: translateY(-6.5px) rotate(-45deg)'
              : ''"
          />
        </button>
      </div>
    </div>

    <!-- ── Mobile menu ──────────────────────────────── -->
    <Transition name="mobile">
      <div
        v-if="mobileOpen"
        class="mobile-menu"
        role="list"
      >
        <div
          role="listitem"
          v-for="link in navLinks"
          :key="link.name"
        >
          <button
            class="mobile-link"
            :class="{ 'mobile-link--active': isActive(link.path) }"
            :aria-current="isActive(link.path) ? 'page' : undefined"
            @click="navigate(link.name)"
          >
            <!-- Home icon -->
            <svg v-if="link.name === 'home'" class="mobile-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
              <path d="M3 9.5L10 3l7 6.5V17a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/>
              <path d="M7 18v-7h6v7"/>
            </svg>
            <!-- About icon -->
            <svg v-else-if="link.name === 'about'" class="mobile-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
              <circle cx="10" cy="10" r="7"/>
              <path d="M10 8v5M10 6h.01"/>
            </svg>
            <!-- Shop icon -->
            <svg v-else-if="link.name === 'catalogue'" class="mobile-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
              <path d="M4 4h12l1.5 10a1 1 0 0 1-1 1.1H3.5a1 1 0 0 1-1-1.1z"/>
              <path d="M7.5 7A2.5 2.5 0 0 1 12.5 7"/>
            </svg>
            <span>{{ link.label }}</span>
            <svg v-if="isActive(link.path)" class="mobile-check" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M2 7l4 4 6-6"/>
            </svg>
          </button>
        </div>

        <div v-if="authStore.isLoggedIn" role="listitem" class="mobile-auth-block">
          <div class="mobile-user">
            <span class="mobile-avatar" aria-hidden="true">
              <img
                v-if="authStore.user?.avatarUrl"
                :src="authStore.user.avatarUrl"
                alt=""
                class="mobile-avatar-img"
                width="40"
                height="40"
                referrerpolicy="no-referrer"
              >
              <template v-else>{{ initials }}</template>
            </span>
            <span class="mobile-user-email">{{ authStore.user?.email }}</span>
          </div>
          <button
            type="button"
            class="mobile-link mobile-link--full mobile-link--row"
            @click="mobileOpen = false; router.push({ name: 'profile' })"
          >
            <svg class="mobile-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
              <path d="M7 3.5h6a1 1 0 0 1 1 1V17a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z"/>
              <path d="M5 6.5h10M8 9.5h6M8 12.5h4"/>
            </svg>
            <span>Orders &amp; profile</span>
          </button>
          <button type="button" class="mobile-link mobile-link--full mobile-link--row" @click="logout">
            <svg class="mobile-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
              <path d="M7 17H4.5A1.5 1.5 0 0 1 3 15.5v-11A1.5 1.5 0 0 1 4.5 3H7"/>
              <path d="M13 14l4-4-4-4M8 10h8"/>
            </svg>
            <span>Sign out</span>
          </button>
        </div>
        <div v-else role="listitem" class="mobile-auth-block">
          <RouterLink
            class="mobile-link mobile-link--full"
            :to="{ name: 'login', query: { redirect: route.fullPath } }"
            @click="mobileOpen = false"
          >
            Sign in
          </RouterLink>
          <RouterLink
            class="mobile-link mobile-link--full"
            :to="{ name: 'register' }"
            @click="mobileOpen = false"
          >
            Register
          </RouterLink>
        </div>
      </div>
    </Transition>
  </nav>
</template>

<style scoped>
/* ── Nav shell ────────────────────────────────────── */
.ewa-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(20, 12, 9, 0.90);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(201, 168, 76, 0.16);
}

.nav-inner {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  column-gap: 16px;
  padding-left: clamp(20px, 4vw, 48px);
  padding-right: clamp(24px, 5vw, 56px);
  height: 72px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

/* ── Logo ─────────────────────────────────────────── */
.nav-logo {
  justify-self: start;
  display: flex;
  align-items: center;
  gap: 11px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: var(--radius-sm);
  transition: opacity 0.2s;
  min-width: 0;
}
.nav-logo:hover { opacity: 0.85; }
.nav-logo:focus-visible {
  outline: 2px solid var(--terra);
  outline-offset: 3px;
}

.logo-mark {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  filter: drop-shadow(0 0 6px rgba(201, 168, 76, 0.2));
}

.logo-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.logo-wordmark {
  font-family: var(--font-serif);
  font-size: 21px;
  font-weight: 300;
  letter-spacing: 0.3em;
  color: var(--ivory);
  line-height: 1;
}

.logo-tagline {
  font-size: 8.5px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--gold);
  font-weight: 300;
  opacity: 0.8;
}

/* ── Desktop links ────────────────────────────────── */
.nav-links {
  justify-self: center;
  display: flex;
  align-items: center;
  gap: 6px;
}

.nav-link {
  position: relative;
  display: flex;
  align-items: center;
  gap: 7px;
  background: none;
  border: none;
  font-family: var(--font-sans);
  font-size: 11px;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: rgba(250, 246, 239, 0.55);
  font-weight: 400;
  cursor: pointer;
  padding: 8px 14px;
  border-radius: var(--radius-sm);
  transition: color 0.22s, background 0.22s;
}

.nav-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  opacity: 0.7;
  transition: opacity 0.22s;
}

.nav-link:hover,
.nav-link--active {
  color: var(--ivory);
  background: rgba(250, 246, 239, 0.05);
}
.nav-link:hover .nav-icon,
.nav-link--active .nav-icon { opacity: 1; }

.nav-link:focus-visible {
  outline: 2px solid var(--terra);
  outline-offset: 2px;
}

/* Underline pip for active state */
.active-pip {
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: 70%;
  height: 2px;
  background: var(--terra);
  border-radius: 99px;
 
}

/* ── Right actions ────────────────────────────────── */
.nav-actions {
  justify-self: end;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
  min-width: 0;
}

.desktop-only {
  display: flex;
  align-items: center;
  gap: 8px;
}

@media (max-width: 768px) {
  .desktop-only {
    display: none !important;
  }
}

.user-wrap {
  position: relative;
}

.avatar-btn {
  width: 40px;
  height: 40px;
  border-radius: 99px;
  padding: 0;
  overflow: hidden;
  border: 2px solid rgba(201, 168, 76, 0.35);
  cursor: pointer;
  background: rgba(250, 246, 239, 0.08);
}
.avatar-btn:focus-visible {
  outline: 2px solid var(--terra);
  outline-offset: 3px;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.avatar-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-family: var(--font-sans);
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--gold);
}

.user-dd {
  position: absolute;
  right: 0;
  top: calc(100% + 10px);
  min-width: 220px;
  background: #1c1310;
  border: 1px solid rgba(201, 168, 76, 0.22);
  border-radius: 8px;
  padding: 12px 14px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
  z-index: 150;
}

.user-dd-email {
  margin: 0 0 10px;
  font-size: 0.72rem;
  opacity: 0.8;
  word-break: break-all;
  color: var(--ivory);
}

.user-dd-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  text-align: left;
  background: none;
  border: none;
  border-top: 1px solid rgba(201, 168, 76, 0.12);
  color: var(--ivory);
  font-size: 0.68rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  cursor: pointer;
  padding: 10px 6px;
}
.user-dd-item:first-of-type {
  border-top: none;
}

.user-dd-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  opacity: 0.85;
}
.user-dd-item:hover {
  color: var(--gold);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.auth-links {
  display: flex;
  align-items: center;
  gap: 4px;
}

.auth-link {
  font-size: 0.62rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(250, 246, 239, 0.55);
  text-decoration: none;
  padding: 8px 10px;
  border-radius: var(--radius-sm);
}
.auth-link:hover {
  color: var(--ivory);
}
.auth-link--emph {
  color: var(--gold);
}

.mobile-auth-block {
  border-top: 1px solid rgba(201, 168, 76, 0.12);
  padding-top: 14px;
  margin-top: 8px;
}

.mobile-user {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px 12px;
}

.mobile-avatar {
  width: 40px;
  height: 40px;
  border-radius: 99px;
  background: rgba(201, 168, 76, 0.2);
  color: var(--gold);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  overflow: hidden;
  flex-shrink: 0;
}

.mobile-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.mobile-user-email {
  font-size: 0.72rem;
  color: rgba(250, 246, 239, 0.65);
  word-break: break-all;
}

.mobile-link--full {
  width: 100%;
}

.mobile-link--row {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: flex-start;
}

/* Cart button */
.cart-btn {
  position: relative;
  background: none;
  border: none;
  color: rgba(250, 246, 239, 0.65);
  cursor: pointer;
  padding: 9px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.22s, background 0.22s;
}
.cart-icon { width: 20px; height: 20px; }
.cart-btn:hover {
  color: var(--ivory);
  background: rgba(250, 246, 239, 0.06);
}
.cart-btn:focus-visible {
  outline: 2px solid var(--terra);
  outline-offset: 3px;
}

/* Badge */
.cart-badge {
  position: absolute;
  top: 3px;
  right: 3px;
  background: var(--terra);
  color: var(--ivory);
  font-family: var(--font-sans);
  font-size: 9px;
  font-weight: 700;
  min-width: 17px;
  height: 17px;
  border-radius: 99px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 3px;
  line-height: 1;
  box-shadow: 0 0 0 2px rgba(20, 12, 9, 0.9);
}

/* Badge pop animation */
.badge-enter-active {
  animation: badgePop 0.32s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.badge-leave-active { transition: opacity 0.15s, transform 0.15s; }
.badge-leave-to     { opacity: 0; transform: scale(0.5); }
@keyframes badgePop {
  from { transform: scale(0); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
}

/* ── Hamburger ────────────────────────────────────── */
.hamburger {
  display: none;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 9px;
  border-radius: var(--radius-sm);
}
.hamburger:focus-visible {
  outline: 2px solid var(--terra);
  outline-offset: 3px;
}

.ham-bar {
  display: block;
  height: 1.5px;
  background: var(--ivory);
  border-radius: 2px;
  transition: transform 0.3s ease, opacity 0.3s ease;
  transform-origin: center;
}
.ham-bar:nth-child(1) { width: 22px; }
.ham-bar:nth-child(2) { width: 16px; }   /* shorter middle bar — visual interest */
.ham-bar:nth-child(3) { width: 22px; }

/* ── Mobile menu ──────────────────────────────────── */
.mobile-menu {
  background: rgba(14, 8, 6, 0.97);
  border-top: 1px solid rgba(201, 168, 76, 0.10);
  padding: 12px 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.mobile-link {
  display: flex;
  align-items: center;
  gap: 12px;
  background: none;
  border: none;
  font-family: var(--font-sans);
  font-size: 12px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: rgba(250, 246, 239, 0.55);
  cursor: pointer;
  padding: 14px 12px;
  border-radius: var(--radius-sm);
  text-align: left;
  width: 100%;
  transition: color 0.2s, background 0.2s;
}
.mobile-link:hover,
.mobile-link--active {
  color: var(--ivory);
  background: rgba(250, 246, 239, 0.04);
}
.mobile-link:focus-visible {
  outline: 2px solid var(--terra);
  outline-offset: 2px;
}

.mobile-icon {
  width: 16px;
  height: 16px;
  opacity: 0.65;
  flex-shrink: 0;
}
.mobile-link--active .mobile-icon { opacity: 1; color: var(--gold); }

.mobile-check {
  margin-left: auto;
  width: 13px;
  height: 13px;
  color: var(--gold);
  flex-shrink: 0;
}

/* Slide-down transition */
.mobile-enter-active { transition: opacity 0.22s ease, transform 0.24s ease; }
.mobile-leave-active { transition: opacity 0.18s ease, transform 0.18s ease; }
.mobile-enter-from,
.mobile-leave-to { opacity: 0; transform: translateY(-10px); }

/* ── Responsive ───────────────────────────────────── */
@media (max-width: 768px) {
  .nav-inner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-left: clamp(16px, 4vw, 24px);
    padding-right: clamp(20px, 5vw, 32px);
  }
  .nav-links {
    display: none;
  }
  .hamburger {
    display: flex;
  }
  .logo-tagline {
    display: none;
  }
}
</style>
