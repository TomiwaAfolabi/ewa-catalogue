<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import EwaPageSpinner from '@/components/ui/EwaPageSpinner.vue'

const router = useRouter()
const auth = useAuthStore()

onMounted(async () => {
  const raw = window.location.hash.startsWith('#')
    ? window.location.hash.slice(1)
    : window.location.hash
  const params = new URLSearchParams(raw)
  const at = params.get('access_token')
  const rt = params.get('refresh_token')

  if (at && rt) {
    auth.applyHashTokens(at, rt)
    await auth.fetchMe()
    const dest = auth.consumeOAuthRedirect()
    await router.replace(dest)
    return
  }

  await router.replace({ name: 'login' })
})
</script>

<template>
  <div class="wrap">
    <EwaPageSpinner
      size="lg"
      label="Completing sign-in. Please wait."
    />
  </div>
</template>

<style scoped>
.wrap {
  min-height: 50vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
  color: #faf6ef;
  background: rgba(28, 19, 16, 0.6);
}
</style>
