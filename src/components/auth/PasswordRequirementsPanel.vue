<script setup lang="ts">
import { computed } from 'vue'
import { evaluatePasswordRules } from '@/utils/formValidation'

const props = defineProps<{
  password: string
}>()

const rules = computed(() => evaluatePasswordRules(props.password))
</script>

<template>
  <div class="password-aside" aria-label="Password requirements">
    <p class="password-aside-title">Password requirements</p>
    <ul class="password-rules">
      <li v-for="r in rules" :key="r.id" :class="{ 'password-rules__met': r.met }">
        <span class="password-rules__icon" aria-hidden="true">{{ r.met ? '✓' : '✕' }}</span>
        <span>{{ r.label }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.password-aside {
  padding: 16px 18px;
  border-radius: 8px;
  background: #fff;
  border: 1px solid rgba(44, 24, 16, 0.12);
}

.password-aside-title {
  margin: 0 0 12px;
  font-size: 0.7rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #5c4033;
}

.password-rules {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 0.8rem;
  letter-spacing: normal;
  text-transform: none;
  color: #b42318;
  line-height: 1.35;
}

.password-rules__met {
  color: #1e5c36;
}

.password-rules li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.password-rules__icon {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.1em;
  height: 1.1em;
  margin-top: 0.1em;
  border-radius: 50%;
  font-size: 0.65rem;
  font-weight: 700;
  line-height: 1;
  background: #c94a3d;
  color: #fff;
}

.password-rules__met .password-rules__icon {
  background: #2d8a52;
}
</style>
