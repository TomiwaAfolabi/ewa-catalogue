<script setup lang="ts">
import { computed, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: string
    autocomplete?: string
    maxlength?: number
    ariaInvalid?: boolean | 'true' | 'false'
    inputId?: string
    invalid?: boolean
  }>(),
  {
    autocomplete: 'current-password',
    ariaInvalid: 'false',
    invalid: false,
  },
)

const emit = defineEmits<{ 'update:modelValue': [v: string] }>()

const show = ref(false)
const inputType = computed(() => (show.value ? 'text' : 'password'))

function onInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
}
</script>

<template>
  <div class="password-wrap" :class="{ 'password-wrap--invalid': invalid }">
    <input
      :id="inputId"
      class="password-input"
      :type="inputType"
      :value="modelValue"
      :autocomplete="autocomplete"
      :maxlength="maxlength"
      :aria-invalid="ariaInvalid"
      @input="onInput"
    >
    <button
      type="button"
      class="password-toggle"
      :aria-pressed="show"
      :aria-label="show ? 'Hide password' : 'Show password'"
      tabindex="0"
      @click="show = !show"
    >
      <!-- eye open -->
      <svg
        v-if="!show"
        class="password-toggle__svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.75"
        aria-hidden="true"
      >
        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      <!-- eye closed -->
      <svg
        v-else
        class="password-toggle__svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.75"
        aria-hidden="true"
      >
        <path d="M3 3l18 18" />
        <path d="M10.58 10.58A3 3 0 0 0 12 15a3 3 0 0 0 0-6 1.5 1.5 0 0 0-1.42 1.58Z" />
        <path d="M9.88 5.09A10.3 10.3 0 0 1 12 5c6 0 10 7 10 7a18.5 18.5 0 0 1-2.16 3.19m-2.72 1.91A10.3 10.3 0 0 1 12 19c-6 0-10-7-10-7 1.63-2.84 4.58-5.45 7.73-6.71" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.password-wrap {
  display: flex;
  align-items: stretch;
  border: 1px solid rgba(44, 24, 16, 0.2);
  border-radius: 6px;
  background: #fff;
  overflow: hidden;
}

.password-wrap:focus-within {
  outline: 2px solid var(--terra, #8b4513);
  outline-offset: 1px;
}

.password-wrap--invalid {
  border-color: #c94a3d;
}

.password-input {
  flex: 1;
  min-width: 0;
  border: none;
  padding: 12px 4px 12px 14px;
  font-size: 1rem;
  background: transparent;
}

.password-input:focus {
  outline: none;
}

.password-toggle {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  border: none;
  background: transparent;
  color: #5c4033;
  cursor: pointer;
}

.password-toggle:hover {
  color: #2c1810;
}

.password-toggle__svg {
  width: 22px;
  height: 22px;
}
</style>
