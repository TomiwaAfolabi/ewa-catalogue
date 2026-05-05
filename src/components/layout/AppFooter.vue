<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <footer class="ewa-footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <span class="footer-wordmark">EWA</span>
        <span class="footer-sub">Beauty in Yoruba · Heritage in Thread</span>
      </div>

      <div class="footer-links">
        <button class="footer-link" @click="router.push({ name: 'home' })">Home</button>
        <button class="footer-link" @click="router.push({ name: 'about' })">About</button>
        <button class="footer-link" @click="router.push({ name: 'catalogue' })">Shop</button>
      </div>

      <div class="footer-right">
        <p class="footer-tagline">A new era of Ewa begins here.</p>
      </div>
    </div>

    <div class="footer-copy">
      © {{ new Date().getFullYear() }} Ewa Brand · All rights reserved
    </div>
  </footer>
</template>

<style scoped>
.ewa-footer {
  background-color: var(--ink);
  padding: 48px 48px 24px;
}

.footer-inner {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 32px;
  max-width: 1400px;
  margin: 0 auto;
}

.footer-brand {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.footer-wordmark {
  font-family: var(--font-serif);
  font-size: 32px;
  font-weight: 300;
  letter-spacing: 0.3em;
  color: var(--ivory);
}

.footer-sub {
  font-size: 10px;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: rgba(201, 168, 76, 0.7);
  font-weight: 300;
}

.footer-links {
  display: flex;
  gap: 32px;
}

.footer-link {
  background: none;
  border: none;
  font-family: var(--font-sans);
  font-size: 11px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: rgba(250, 246, 239, 0.45);
  font-weight: 300;
  cursor: pointer;
  transition: color var(--transition-base);
}
.footer-link:hover { color: var(--gold); }

.footer-right {
  text-align: right;
}

.footer-tagline {
  font-family: var(--font-serif);
  font-size: 16px;
  font-style: italic;
  color: rgba(245, 237, 228, 0.4);
}

.footer-copy {
  font-size: 11px;
  color: rgba(245, 237, 228, 0.25);
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid rgba(245, 237, 228, 0.08);
  letter-spacing: 0.2em;
  text-align: center;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
}

@media (max-width: 768px) {
  .ewa-footer { padding: 40px 20px 20px; }
  .footer-inner {
    grid-template-columns: 1fr;
    text-align: center;
  }
  .footer-brand { align-items: center; }
  .footer-links { justify-content: center; }
  .footer-right { text-align: center; }
}
</style>
