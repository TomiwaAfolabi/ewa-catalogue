<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <div class="not-found">
    <div class="nf-inner">
      <span class="section-label">404</span>
      <h1 class="nf-title">Page Not Found</h1>
      <p class="nf-body">The page you're looking for doesn't exist or has been moved.</p>
      <button class="btn-primary" @click="router.push({ name: 'home' })">
        Return Home
      </button>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(28, 19, 16, 0.75);
  padding: 48px;
}

.nf-inner {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.nf-title {
  font-family: var(--font-serif);
  font-size: 56px;
  font-weight: 300;
  color: var(--ivory);
}

.nf-body {
  font-size: 15px;
  color: var(--muted);
  font-weight: 300;
  letter-spacing: 0.05em;
}
</style>
