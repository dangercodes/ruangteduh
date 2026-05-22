<template>
  <div class="space-y-6 pb-10">
    <!-- Header -->
    <div class="animate-slide-up flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
          {{ $t('journal.title') }}
        </h1>
        <p class="text-text-secondary mt-1 text-sm sm:text-base font-medium">
          {{ $t('journal.subtitle') }}
        </p>
      </div>
      <!-- Write New Button -->
      <SoftButton
        variant="primary"
        size="md"
        class="shadow-glow-primary self-start sm:self-auto cursor-pointer"
        @click="navigateTo('/journal/write')"
      >
        <span>{{ $t('journal.newEntry') }}</span>
      </SoftButton>
    </div>

    <!-- Guest Mode Warning Card -->
    <GlassCard
      v-if="authStore.isGuest"
      variant="frosted"
      padding="md"
      class="animate-slide-up stagger-1 border border-warning/40 bg-amber-50/15 relative overflow-hidden"
    >
      <div class="absolute -right-8 -top-8 w-24 h-24 bg-warning/5 rounded-full blur-xl pointer-events-none" />
      <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div class="space-y-1">
          <h4 class="text-sm font-bold text-amber-700 flex items-center gap-1.5">
            <span>⚠️</span> {{ $t('journal.guestWarning.title') }}
          </h4>
          <p class="text-xs text-text-secondary leading-relaxed max-w-2xl">
            {{ $t('journal.guestWarning.message') }}
          </p>
        </div>
        <SoftButton
          variant="outline"
          size="sm"
          class="border-warning/30 hover:bg-warning/10 text-amber-700 hover:text-amber-800 font-bold whitespace-nowrap"
          @click="navigateTo('/auth/register')"
        >
          {{ $t('auth.login.register') }}
        </SoftButton>
      </div>
    </GlassCard>

    <!-- Search & Filter Controls -->
    <div class="relative z-20 animate-slide-up stagger-2 flex flex-col sm:flex-row gap-4 items-stretch">
      <!-- Search Input -->
      <div class="flex-1 relative">
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="$t('journal.searchPlaceholder')"
          class="w-full pl-11 pr-10 py-3 bg-white/80 backdrop-blur-md rounded-2xl border border-border-soft/90 text-sm text-text-primary placeholder:text-text-muted transition-all shadow-soft font-medium focus:bg-white"
        />
        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/80 pointer-events-none">
          <svg class="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <button
          v-if="searchQuery"
          @click="searchQuery = ''"
          class="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary text-xs cursor-pointer transition-colors w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-100/90"
        >
          ✕
        </button>
      </div>

      <!-- Mood Tag Filter Selector (Custom Premium Dropdown) -->
      <div class="relative sm:w-60 w-full">
        <button
          type="button"
          @click="isMoodDropdownOpen = !isMoodDropdownOpen"
          class="w-full flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-md rounded-2xl border border-border-soft/90 text-sm text-text-primary transition-all shadow-soft cursor-pointer text-left font-medium select-none hover:bg-white/90"
          :class="isMoodDropdownOpen ? 'ring-2 ring-primary-500 bg-white border-primary-500' : ''"
        >
          <span class="flex items-center gap-2 truncate">
            <span v-if="selectedMoodFilter" class="flex items-center gap-1.5">
              <span class="text-base">{{ moodConfig[selectedMoodFilter]?.emoji }}</span>
              <span class="font-bold" :style="{ color: moodConfig[selectedMoodFilter]?.color }">
                {{ $t(`mood.emotions.${selectedMoodFilter}`) }}
              </span>
            </span>
            <span v-else class="text-text-secondary/80 flex items-center gap-1.5 font-semibold">
              <span>🔍</span> {{ locale === 'id' ? 'Semua Mood' : 'All Moods' }}
            </span>
          </span>
          <svg
            class="w-4 h-4 text-text-muted/80 transition-transform duration-300 flex-shrink-0 ml-2"
            :class="{ 'rotate-180': isMoodDropdownOpen }"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <!-- Invisible Overlay to catch outside clicks -->
        <div
          v-if="isMoodDropdownOpen"
          class="fixed inset-0 z-20"
          @click="isMoodDropdownOpen = false"
        />

        <!-- Dropdown Menu (Glassmorphic Popover) -->
        <Transition
          enter-active-class="transition ease-out duration-200"
          enter-from-class="opacity-0 translate-y-1 scale-95"
          enter-to-class="opacity-100 translate-y-0 scale-100"
          leave-active-class="transition ease-in duration-150"
          leave-from-class="opacity-100 translate-y-0 scale-100"
          leave-to-class="opacity-0 translate-y-1 scale-95"
        >
          <div
            v-if="isMoodDropdownOpen"
            class="absolute right-0 z-30 mt-2.5 w-full min-w-[220px] bg-white/95 backdrop-blur-xl border border-border-soft/60 rounded-2xl shadow-float max-h-72 overflow-y-auto p-1.5"
          >
            <!-- All Moods option -->
            <button
              type="button"
              @click="selectMoodFilter('')"
              class="w-full text-left px-3.5 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 flex items-center gap-2.5 cursor-pointer"
              :class="!selectedMoodFilter ? 'bg-primary-50 text-primary-600' : 'text-text-secondary hover:bg-slate-50/80'"
            >
              <span class="text-base">🔍</span>
              <span>{{ locale === 'id' ? 'Semua Mood' : 'All Moods' }}</span>
            </button>

            <div class="h-px bg-border-soft/40 my-1" />

            <!-- Mood options -->
            <button
              v-for="(val, key) in moodConfig"
              :key="String(key)"
              type="button"
              @click="selectMoodFilter(String(key))"
              class="w-full text-left px-3.5 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 flex items-center gap-2.5 cursor-pointer"
              :class="selectedMoodFilter === String(key) ? '' : 'text-text-secondary hover:bg-slate-50/80'"
              :style="selectedMoodFilter === String(key) ? { backgroundColor: val.color + '12', color: val.color } : {}"
            >
              <span class="text-base">{{ val.emoji }}</span>
              <span>{{ $t(`mood.emotions.${key}`) }}</span>
              <span v-if="selectedMoodFilter === String(key)" class="ml-auto text-[10px]">✓</span>
            </button>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Active Filter Pill -->
    <div v-if="selectedMoodFilter" class="animate-slide-up flex items-center gap-2">
      <span class="text-xs text-text-muted font-medium">{{ locale === 'id' ? 'Filter aktif:' : 'Active filter:' }}</span>
      <button
        @click="selectedMoodFilter = ''"
        class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-all hover:opacity-80"
        :style="{
          backgroundColor: moodConfig[selectedMoodFilter]?.color + '15',
          color: moodConfig[selectedMoodFilter]?.color,
          border: '1px solid ' + moodConfig[selectedMoodFilter]?.color + '30'
        }"
      >
        <span>{{ moodConfig[selectedMoodFilter]?.emoji }}</span>
        <span>{{ $t(`mood.emotions.${selectedMoodFilter}`) }}</span>
        <span class="ml-1 opacity-60">✕</span>
      </button>
    </div>

    <!-- Journal Feed & Content List -->
    <div class="animate-slide-up stagger-3">
      <div v-if="loading">
        <LoadingSkeleton variant="card" v-for="i in 3" :key="i" />
      </div>
      
      <div v-else-if="filteredJournals.length === 0">
        <EmptyState
          icon="📓"
          :title="$t('journal.empty.title')"
          :description="searchQuery || selectedMoodFilter ? (locale === 'id' ? 'Tidak ada jurnal yang cocok dengan filter pencarian.' : 'No journals match your search filters.') : $t('journal.empty.description')"
          :action-label="!searchQuery && !selectedMoodFilter ? $t('journal.newEntry') : undefined"
          action-to="/journal/write"
        />
      </div>

      <div v-else class="space-y-8">
        <!-- Date Groups -->
        <div v-for="group in groupedJournals" :key="group.date" class="space-y-4">
          <!-- Date Sticky Label -->
          <div class="flex items-center gap-3">
            <span class="text-xs font-extrabold text-primary-500 bg-primary-50 border border-primary-100 px-3 py-1 rounded-full uppercase tracking-wider shadow-soft">
              {{ formatDate(group.date) }}
            </span>
            <div class="h-px bg-border-soft flex-1" />
          </div>

          <!-- Entries in this Group -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <GlassCard
              v-for="entry in group.entries"
              :key="entry.id"
              variant="frosted"
              padding="md"
              :hover="true"
              class="border border-white/50 bg-white/70 hover:border-primary-200/50 hover:shadow-medium transition-all duration-300 relative flex flex-col justify-between cursor-pointer"
              @click="navigateTo(`/journal/${entry.id}`)"
            >
              <div class="space-y-3">
                <div class="flex items-start justify-between gap-3">
                  <h3 class="text-base font-bold text-text-primary line-clamp-1 group-hover:text-primary-600 transition-colors">
                    {{ entry.title || $t('journal.noTitle') }}
                  </h3>
                  <!-- Mood Tag indicator -->
                  <div
                    v-if="entry.mood_tag"
                    class="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0"
                    :style="{
                      backgroundColor: getMoodColor(entry.mood_tag) + '15',
                      color: getMoodColor(entry.mood_tag)
                    }"
                  >
                    <span>{{ getMoodEmoji(entry.mood_tag) }}</span>
                    <span>{{ $t(`mood.emotions.${entry.mood_tag}`) }}</span>
                  </div>
                </div>

                <!-- Content snippet -->
                <p class="text-sm text-text-secondary leading-relaxed line-clamp-3 whitespace-pre-line">
                  {{ entry.content }}
                </p>
              </div>

              <!-- Entry Footer info -->
              <div class="flex items-center justify-between border-t border-border-soft/40 pt-3 mt-4 text-xs text-text-muted">
                <span class="flex items-center gap-1 font-medium">
                  🕒 {{ formatTime(entry.created_at) }}
                </span>
                <span class="text-primary-500 hover:text-primary-600 font-extrabold transition-colors flex items-center gap-0.5">
                  {{ $t('journal.readMore') }} <span>→</span>
                </span>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import type { JournalEntry } from '~/types'

definePageMeta({
  layout: 'default',
  middleware: ['auth'],
})

useHead({
  title: 'Jurnal & Diary — RuangTeduh',
})

const { locale, t } = useI18n()
const authStore = useAuthStore()
const journalStore = useJournalStore()
const { journals, loading } = storeToRefs(journalStore)

const searchQuery = ref('')
const selectedMoodFilter = ref('')
const isMoodDropdownOpen = ref(false)

const selectMoodFilter = (mood: string) => {
  selectedMoodFilter.value = mood
  isMoodDropdownOpen.value = false
}

// Mood config for styling
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

// Filters logic
const filteredJournals = computed(() => {
  let list = journals.value || []
  
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(j => 
      (j.title && j.title.toLowerCase().includes(q)) || 
      (j.content && j.content.toLowerCase().includes(q))
    )
  }
  
  if (selectedMoodFilter.value) {
    list = list.filter(j => j.mood_tag === selectedMoodFilter.value)
  }
  
  return list
})

// Groups logic
const groupedJournals = computed(() => {
  const groups: Record<string, JournalEntry[]> = {}
  
  filteredJournals.value.forEach(j => {
    const dateStr = j.date
    if (!groups[dateStr]) {
      groups[dateStr] = []
    }
    groups[dateStr].push(j)
  })
  
  // Sort dates descending
  return Object.keys(groups)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    .map(date => ({
      date,
      entries: groups[date]
    }))
})

// Date calculations
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  
  const dateMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  const diff = nowMidnight.getTime() - dateMidnight.getTime()
  const days = Math.round(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return t('common.today')
  if (days === 1) return t('common.yesterday')
  if (days > 1 && days < 7) return t('common.daysAgo', { count: days })
  
  return date.toLocaleDateString(locale.value === 'id' ? 'id-ID' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const formatTime = (isoString: string) => {
  const date = new Date(isoString)
  return date.toLocaleTimeString(locale.value === 'id' ? 'id-ID' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  journalStore.fetchJournals()
})
</script>
