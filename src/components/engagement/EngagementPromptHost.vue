<script setup lang="ts">
import { useEngagementPrompt } from '@/composables/useEngagementPrompt'
import EngagementPromptModal from '@/components/engagement/EngagementPromptModal.vue'

const { prompt, dismissing, dismiss, makeRequest } = useEngagementPrompt()
</script>

<template>
  <EngagementPromptModal
    :open="!!prompt"
    :prompt="prompt"
    :busy="dismissing"
    @dismiss="dismiss"
    @make-request="makeRequest"
  />
</template>
