<template>
  <div
    class="flex gap-3 animate-slide-up"
    :class="isUser ? 'flex-row-reverse' : 'flex-row'"
  >
    <!-- Avatar -->
    <div
      class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm"
      :class="isUser ? 'bg-primary-100' : 'bg-lavender-100'"
    >
      {{ isUser ? '👤' : '🌿' }}
    </div>

    <!-- Bubble -->
    <div class="max-w-[80%] sm:max-w-[70%]">
      <div
        class="px-4 py-3 text-sm leading-relaxed"
        :class="[
          isUser
            ? 'bg-primary-500 text-white rounded-2xl rounded-br-md shadow-soft'
            : 'bg-white border border-border-soft text-text-primary rounded-2xl rounded-bl-md shadow-soft',
        ]"
      >
        <!-- Typing indicator -->
        <div v-if="typing" class="flex items-center gap-1.5 py-1">
          <span class="w-2 h-2 rounded-full bg-text-muted animate-typing" style="animation-delay: 0s" />
          <span class="w-2 h-2 rounded-full bg-text-muted animate-typing" style="animation-delay: 0.2s" />
          <span class="w-2 h-2 rounded-full bg-text-muted animate-typing" style="animation-delay: 0.4s" />
        </div>

        <!-- Message content -->
        <div v-else class="whitespace-pre-wrap break-words">
          {{ content }}
        </div>
      </div>

      <!-- Timestamp -->
      <p
        class="text-[10px] mt-1 px-1"
        :class="isUser ? 'text-right text-text-muted' : 'text-left text-text-muted'"
      >
        {{ formattedTime }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  content: string
  role: 'user' | 'assistant'
  timestamp?: string
  typing?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  typing: false,
})

const isUser = computed(() => props.role === 'user')

const formattedTime = computed(() => {
  if (!props.timestamp) return ''
  const date = new Date(props.timestamp)
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
})
</script>
