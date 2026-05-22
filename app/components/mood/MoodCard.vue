<template>
  <div class="flex flex-col items-center p-4 rounded-2xl bg-white/50 border border-border-soft transition-all duration-200 hover:shadow-soft group">
    <div class="flex items-center justify-between w-full mb-2">
      <span class="text-3xl">{{ moodEmoji }}</span>
      <span class="text-xs text-text-muted">{{ formattedDate }}</span>
    </div>
    <div class="w-full">
      <span
        class="inline-block px-2.5 py-1 rounded-full text-xs font-medium mb-2"
        :style="{ backgroundColor: moodColor + '20', color: moodColor }"
      >
        {{ moodLabel }}
      </span>
      <p v-if="entry.note" class="text-sm text-text-secondary leading-relaxed line-clamp-2">
        {{ entry.note }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MoodEntry } from '~/types'

interface Props {
  entry: MoodEntry
}

const props = defineProps<Props>()
const { t } = useI18n()

const moodConfig: Record<string, { emoji: string; color: string }> = {
  sangat_baik: { emoji: '😄', color: '#10b981' },
  baik: { emoji: '😊', color: '#34d399' },
  biasa: { emoji: '😐', color: '#f59e0b' },
  sedih: { emoji: '😢', color: '#6366f1' },
  sangat_sedih: { emoji: '😭', color: '#8b5cf6' },
  cemas: { emoji: '😰', color: '#f97316' },
  marah: { emoji: '😠', color: '#ef4444' },
  lelah: { emoji: '😴', color: '#64748b' },
}

const moodEmoji = computed(() => moodConfig[props.entry.mood]?.emoji || '😐')
const moodColor = computed(() => moodConfig[props.entry.mood]?.color || '#64748b')
const moodLabel = computed(() => t(`mood.emotions.${props.entry.mood}`))

const formattedDate = computed(() => {
  const date = new Date(props.entry.created_at)
  const now = new Date()
  
  const dateMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  const diff = nowMidnight.getTime() - dateMidnight.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return t('common.today')
  if (days === 1) return t('common.yesterday')
  if (days < 7) return t('common.daysAgo', { count: days })

  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
})
</script>
