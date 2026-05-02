<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCartStore } from '@/stores/cartStore'

const router = useRouter()
const route = useRoute()
const cartStore = useCartStore()

const mobileOpen = ref(false)

const navLinks = [
  { label: 'Home',       name: 'home',      path: '/' },
  { label: 'Shop',       name: 'catalogue', path: '/catalogue' },
]

const isActive = (path: string) => route.path === path

function navigate(name: string) {
  mobileOpen.value = false
  router.push({ name })
}

function toggleMobile() {
  mobileOpen.value = !mobileOpen.value
}
</script>

<template>
  <!-- ── Desktop Nav ─────────────────────────────────────────────────────── -->
  <nav class="ewa-nav" :class="{ 'nav-mobile-open': mobileOpen }">
    <div class="nav-inner">
      <!-- Logo -->
      <button class="nav-logo" @click="navigate('home')" aria-label="EWA Home">
        <img src="/logo/EwaLogo.jpg" alt="EWA Logo" class="logo-img" />
        <div class="logo-text">
          <span class="logo-wordmark">EWA</span>
          <span class="logo-tagline">Born of Beauty · Rooted in Heritage</span>
        </div>
      </button>

      <!-- Desktop links -->
      <div class="nav-links" aria-label="Main navigation">
        <button
          v-for="link in navLinks"
          :key="link.name"
          class="nav-link"
          :class="{ 'nav-link--active': isActive(link.path) }"
          @click="navigate(link.name)"
        >
          {{ link.label }}
        </button>
      </div>

      <!-- Right actions -->
      <div class="nav-actions">
        <!-- Cart button — wired to cartStore, ready for checkout page -->
        <button
          class="cart-btn"
          @click="cartStore.toggleCart()"
          :aria-label="`Cart (${cartStore.totalItems} items)`"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          <span v-if="cartStore.totalItems > 0" class="cart-badge">
            {{ cartStore.totalItems }}
          </span>
        </button>

        <!-- Mobile hamburger -->
        <button
          class="hamburger"
          @click="toggleMobile"
          :aria-expanded="mobileOpen"
          aria-label="Toggle menu"
        >
          <span class="ham-line" :class="{ 'ham-open': mobileOpen }" />
          <span class="ham-line" :class="{ 'ham-open': mobileOpen }" />
          <span class="ham-line" :class="{ 'ham-open': mobileOpen }" />
        </button>
      </div>
    </div>

    <!-- ── Mobile Menu ────────────────────────────────────────────────────── -->
    <Transition name="mobile-menu">
      <div v-if="mobileOpen" class="mobile-menu">
        <button
          v-for="link in navLinks"
          :key="link.name"
          class="mobile-link"
          :class="{ 'mobile-link--active': isActive(link.path) }"
          @click="navigate(link.name)"
        >
          {{ link.label }}
        </button>
      </div>
    </Transition>
  </nav>
</template>

<style scoped>
.ewa-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(28, 19, 16, 0.88);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(201, 168, 76, 0.2);
}

.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 48px;
  height: 72px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

/* ── Logo ─────────────────────────── */
.nav-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.logo-img {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-sm);
  object-fit: cover;
}

.logo-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.logo-wordmark {
  font-family: var(--font-serif);
  font-size: 22px;
  font-weight: 300;
  letter-spacing: 0.25em;
  color: var(--ivory);
  line-height: 1;
}

.logo-tagline {
  font-size: 9px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--gold);
  font-weight: 300;
  margin-top: 2px;
}

/* ── Links ────────────────────────── */
.nav-links {
  display: flex;
  gap: 40px;
  align-items: center;
}

.nav-link {
  background: none;
  border: none;
  font-family: var(--font-sans);
  font-size: 11px;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  color: rgba(250, 246, 239, 0.65);
  font-weight: 400;
  cursor: pointer;
  padding: 4px 0;
  border-bottom: 1px solid transparent;
  transition: color var(--transition-base), border-color var(--transition-base);
}

.nav-link:hover,
.nav-link--active {
  color: var(--ivory);
  border-color: var(--terra-light);
}

/* ── Actions ──────────────────────── */
.nav-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.cart-btn {
  position: relative;
  background: none;
  border: none;
  color: var(--ivory);
  cursor: pointer;
  padding: 6px;
  opacity: 0.75;
  transition: opacity var(--transition-base);
}
.cart-btn:hover { opacity: 1; }

.cart-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: var(--terra);
  color: var(--ivory);
  font-size: 9px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
}

/* ── Hamburger ────────────────────── */
.hamburger {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
}

.ham-line {
  display: block;
  width: 22px;
  height: 1px;
  background: var(--ivory);
  transition: transform 0.3s ease, opacity 0.3s ease;
}

/* ── Mobile menu ──────────────────── */
.mobile-menu {
  background: rgba(28, 19, 16, 0.96);
  border-top: 1px solid rgba(201, 168, 76, 0.15);
  padding: 24px 48px 32px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mobile-link {
  background: none;
  border: none;
  font-family: var(--font-sans);
  font-size: 13px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: rgba(250, 246, 239, 0.65);
  font-weight: 300;
  cursor: pointer;
  padding: 12px 0;
  text-align: left;
  border-bottom: 1px solid rgba(201, 168, 76, 0.1);
  transition: color var(--transition-base);
}

.mobile-link:hover,
.mobile-link--active {
  color: var(--ivory);
}

.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ── Responsive ───────────────────── */
@media (max-width: 768px) {
  .nav-inner { padding: 0 20px; }
  .nav-links  { display: none; }
  .hamburger  { display: flex; }
  .logo-tagline { display: none; }
  .mobile-menu { padding: 20px; }
}
</style>
