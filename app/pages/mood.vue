<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="animate-slide-up">
      <h1 class="text-2xl font-bold text-text-primary">{{ $t('mood.title') }}</h1>
    </div>
    <!-- Today's Mood -->
    <GlassCard variant="frosted" padding="lg" class="animate-slide-up stagger-1">
      <div v-if="loading" class="flex flex-col items-center justify-center py-4">
        <LoadingSkeleton variant="mood" />
      </div>
      <template v-else>
        <div v-if="todayMood" class="text-center space-y-3">
          <p class="text-sm text-text-secondary">{{ $t('common.today') }}</p>
          <div class="text-5xl">{{ getMoodEmoji(todayMood.mood) }}</div>
          <p class="text-sm font-medium text-text-primary">{{ $t(`mood.emotions.${todayMood.mood}`) }}</p>
          <p v-if="todayMood.note" class="text-sm text-text-secondary italic">"{{ todayMood.note }}"</p>
        </div>
        <div v-else>
          <EmotionSelector v-model="selectedMood" />
          <div v-if="selectedMood" class="mt-4 space-y-3">
            <textarea
              v-model="moodNote"
              :placeholder="$t('mood.notePlaceholder')"
              class="w-full px-4 py-3 bg-surface-dim rounded-xl border-0 text-sm text-text-primary placeholder-text-muted resize-none focus:ring-2 focus:ring-primary-300 focus:bg-white transition-all"
              rows="3"
            />
            <SoftButton variant="primary" class="w-full" size="lg" :loading="saving" @click="handleSaveMood">
              {{ $t('mood.submit') }}
            </SoftButton>
          </div>
        </div>
      </template>
    </GlassCard>
    <!-- Stats -->
    <div v-if="moodStats" class="grid grid-cols-3 gap-3 animate-slide-up stagger-2">
      <GlassCard variant="solid" padding="sm">
        <div class="text-center">
          <p class="text-2xl font-bold text-primary-500">{{ moodStats.total }}</p>
          <p class="text-xs text-text-muted">{{ $t('profile.totalEntries') }}</p>
        </div>
      </GlassCard>
      <GlassCard variant="solid" padding="sm">
        <div class="text-center">
          <p class="text-2xl font-bold text-lavender-500">{{ moodStats.average.toFixed(1) }}</p>
          <p class="text-xs text-text-muted">{{ $t('profile.avgMood') }}</p>
        </div>
      </GlassCard>
      <GlassCard variant="solid" padding="sm">
        <div class="text-center">
          <p class="text-2xl font-bold text-calm-500">{{ moodStats.streak }}🔥</p>
          <p class="text-xs text-text-muted">{{ $t('profile.currentStreak') }}</p>
        </div>
      </GlassCard>
    </div>
    <!-- Mood History -->
    <div class="animate-slide-up stagger-3">
      <h2 class="text-lg font-semibold text-text-primary mb-4">{{ $t('mood.history.title') }}</h2>
      <div v-if="loading">
        <LoadingSkeleton variant="card" v-for="i in 3" :key="i" />
      </div>
      <div v-else-if="moods.length === 0">
        <EmptyState
          icon="🌱"
          :title="$t('mood.history.title')"
          :description="$t('mood.history.empty')"
        />
      </div>
      <div v-else class="space-y-3">
        <!-- Timeline -->
        <div class="relative">
          <div class="absolute left-6 top-0 bottom-0 w-0.5 bg-border-soft" />
          <div v-for="(entry, index) in moods" :key="entry.id" class="relative flex gap-4 pb-4">
            <!-- Timeline dot -->
            <div class="relative z-10 w-12 h-12 rounded-2xl bg-white shadow-soft flex items-center justify-center text-2xl flex-shrink-0">
              {{ getMoodEmoji(entry.mood) }}
            </div>
            <!-- Content -->
            <div class="flex-1 pt-1">
              <div class="flex items-center gap-2 mb-1">
                <span
                  class="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
                  :style="{ backgroundColor: getMoodColor(entry.mood) + '20', color: getMoodColor(entry.mood) }"
                >
                  {{ $t(`mood.emotions.${entry.mood}`) }}
                </span>
                <span class="text-xs text-text-muted">{{ formatDate(entry.created_at) }}</span>
              </div>
              <p v-if="entry.note" class="text-sm text-text-secondary leading-relaxed">
                {{ entry.note }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { MoodType } from '~/types'
import { storeToRefs } from 'pinia'
definePageMeta({
  layout: 'default',
  middleware: ['auth'],
})
useHead({
  title: 'Mood Tracker — RuangTeduh',
})

const moodStore = useMoodStore()
const { moods, loading, todayMood, moodStats } = storeToRefs(moodStore)
const { t } = useI18n()
const selectedMood = ref<MoodType | null>(null)
const moodNote = ref('')
const saving = ref(false)
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
const getMoodEmoji = (mood: string) => moodConfig[mood]?.emoji || '😐'
const getMoodColor = (mood: string) => moodConfig[mood]?.color || '#64748b'
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  
  // Align to midnight to get accurate calendar day difference
  const dateMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  const diff = nowMidnight.getTime() - dateMidnight.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return t('common.today')
  if (days === 1) return t('common.yesterday')
  if (days < 7) return t('common.daysAgo', { count: days })
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}
const handleSaveMood = async () => {
  if (!selectedMood.value) return
  saving.value = true
  try {
    await moodStore.submitMood(selectedMood.value, moodNote.value || null)
    selectedMood.value = null
    moodNote.value = ''
  } catch (e) {
    console.error(e)
  } finally {
    saving.value = false
  }
}
onMounted(() => {
  moodStore.fetchMoods()
})
</script>