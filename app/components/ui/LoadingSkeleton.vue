<template>
  <div class="animate-pulse">
    <!-- Text variant -->
    <template v-if="variant === 'text'">
      <div v-for="i in lines" :key="i" class="mb-3">
        <div
          class="h-4 bg-surface-dim rounded-lg"
          :style="{ width: i === lines ? '60%' : '100%' }"
        />
      </div>
    </template>

    <!-- Card variant -->
    <template v-else-if="variant === 'card'">
      <div class="rounded-2xl bg-surface-dim p-6 space-y-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-border-soft" />
          <div class="space-y-2 flex-1">
            <div class="h-4 bg-border-soft rounded-lg w-1/3" />
            <div class="h-3 bg-border-soft rounded-lg w-1/4" />
          </div>
        </div>
        <div class="space-y-2">
          <div class="h-4 bg-border-soft rounded-lg w-full" />
          <div class="h-4 bg-border-soft rounded-lg w-5/6" />
          <div class="h-4 bg-border-soft rounded-lg w-2/3" />
        </div>
      </div>
    </template>

    <!-- Avatar variant -->
    <template v-else-if="variant === 'avatar'">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-full bg-surface-dim" />
        <div class="space-y-2 flex-1">
          <div class="h-4 bg-surface-dim rounded-lg w-1/3" />
          <div class="h-3 bg-surface-dim rounded-lg w-1/2" />
        </div>
      </div>
    </template>

    <!-- Chat variant -->
    <template v-else-if="variant === 'chat'">
      <div class="space-y-4">
        <div class="flex justify-end">
          <div class="h-12 bg-primary-100 rounded-2xl rounded-br-md w-2/3" />
        </div>
        <div class="flex justify-start">
          <div class="h-20 bg-surface-dim rounded-2xl rounded-bl-md w-3/4" />
        </div>
        <div class="flex justify-end">
          <div class="h-10 bg-primary-100 rounded-2xl rounded-br-md w-1/2" />
        </div>
      </div>
    </template>

    <!-- Mood variant -->
    <template v-else-if="variant === 'mood'">
      <div class="flex gap-3 justify-center">
        <div v-for="i in 5" :key="i" class="w-14 h-14 rounded-2xl bg-surface-dim" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'text' | 'card' | 'avatar' | 'chat' | 'mood'
  lines?: number
}

withDefaults(defineProps<Props>(), {
  variant: 'text',
  lines: 3,
})
</script>
