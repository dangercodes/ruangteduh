<template>
  <div class="space-y-3">
    <p class="text-sm font-medium text-text-secondary text-center">
      {{ $t('mood.today') }}
    </p>
    <div class="grid grid-cols-4 gap-3">
      <button
        v-for="mood in moods"
        :key="mood.value"
        @click="selectMood(mood.value)"
        class="flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all duration-300 focus-ring"
        :class="[
          selected === mood.value
            ? 'bg-white shadow-medium scale-105 ring-2 ring-primary-300'
            : 'bg-white/40 hover:bg-white/70 hover:shadow-soft hover:scale-[1.02]'
        ]"
      >
        <span
          class="text-3xl transition-transform duration-300"
          :class="selected === mood.value ? 'scale-110 animate-scale-in' : ''"
        >
          {{ mood.emoji }}
        </span>
        <span
          class="text-[11px] font-medium leading-tight text-center transition-colors"
          :class="selected === mood.value ? 'text-primary-600' : 'text-text-muted'"
        >
          {{ $t(`mood.emotions.${mood.value}`) }}
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MoodType, MoodOption } from '~/types'

interface Props {
  modelValue?: MoodType | null
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
})

const emit = defineEmits<{
  'update:modelValue': [value: MoodType]
}>()

const selected = computed(() => props.modelValue)

const moods: MoodOption[] = [
  { value: 'sangat_baik', emoji: '😄', label: 'Sangat Baik', color: '#10b981' },
  { value: 'baik', emoji: '😊', label: 'Baik', color: '#34d399' },
  { value: 'biasa', emoji: '😐', label: 'Biasa', color: '#f59e0b' },
  { value: 'sedih', emoji: '😢', label: 'Sedih', color: '#6366f1' },
  { value: 'sangat_sedih', emoji: '😭', label: 'Sangat Sedih', color: '#8b5cf6' },
  { value: 'cemas', emoji: '😰', label: 'Cemas', color: '#f97316' },
  { value: 'marah', emoji: '😠', label: 'Marah', color: '#ef4444' },
  { value: 'lelah', emoji: '😴', label: 'Lelah', color: '#64748b' },
]

const selectMood = (value: MoodType) => {
  emit('update:modelValue', value)
}
</script>
