<template>
  <div class="glass-strong rounded-2xl p-3 border-t border-border-soft">
    <div class="flex items-center gap-2">
      <div class="flex-1 relative">
        <textarea
          ref="textareaRef"
          v-model="message"
          :placeholder="$t('chat.placeholder')"
          :disabled="disabled"
          rows="1"
          class="w-full px-4 py-3 bg-surface-dim rounded-xl border-0 text-sm leading-5 text-text-primary placeholder-text-muted resize-none focus:ring-2 focus:ring-primary-300 focus:bg-white transition-all max-h-32 overflow-y-auto block"
          @keydown.enter.exact.prevent="sendMessage"
          @input="autoResize"
        />
      </div>
      <button
        @click="sendMessage"
        :disabled="!message.trim() || disabled"
        class="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200"
        :class="message.trim() && !disabled
          ? 'gradient-primary text-white shadow-soft hover:shadow-glow-primary hover:scale-105 active:scale-95'
          : 'bg-surface-dim text-text-muted cursor-not-allowed'"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19V5m0 0l-7 7m7-7l7 7" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  disabled: false,
})

const emit = defineEmits<{
  send: [message: string]
}>()

const message = ref('')
const textareaRef = ref<HTMLTextAreaElement>()

const sendMessage = () => {
  const text = message.value.trim()
  if (!text) return
  emit('send', text)
  message.value = ''
  nextTick(() => autoResize())
}

const autoResize = () => {
  const textarea = textareaRef.value
  if (!textarea) return
  textarea.style.height = 'auto'
  textarea.style.height = Math.min(textarea.scrollHeight, 128) + 'px'
}

// Focus and auto-resize on mount
onMounted(() => {
  textareaRef.value?.focus()
  autoResize()
})
</script>
