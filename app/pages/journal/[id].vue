<template>
  <div class="max-w-2xl mx-auto space-y-6 pb-12">
    <!-- Back to Feed Nav -->
    <div class="animate-slide-up">
      <button
        @click="navigateTo('/journal')"
        class="inline-flex items-center gap-1.5 text-xs font-extrabold text-primary-500 hover:text-primary-600 transition-colors uppercase tracking-wider cursor-pointer"
      >
        <span>←</span>
        <span>{{ $t('journal.back') }}</span>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="animate-pulse">
      <LoadingSkeleton variant="card" />
    </div>

    <!-- Main Detail GlassCard -->
    <div v-else-if="entry" class="animate-slide-up stagger-1 space-y-6">
      <GlassCard
        variant="frosted"
        padding="lg"
        class="border border-white/70 shadow-medium relative overflow-hidden"
      >
        <!-- Top Mood & Time Header -->
        <div class="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border-soft/60">
          <div class="flex items-center gap-2">
            <!-- Mood Badge -->
            <div
              v-if="entry.mood_tag"
              class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-soft"
              :style="{
                backgroundColor: getMoodColor(entry.mood_tag) + '15',
                color: getMoodColor(entry.mood_tag),
                border: '1px solid ' + getMoodColor(entry.mood_tag) + '20'
              }"
            >
              <span>{{ getMoodEmoji(entry.mood_tag) }}</span>
              <span>{{ $t(`mood.emotions.${entry.mood_tag}`) }}</span>
            </div>

            <!-- Date Label -->
            <span class="text-xs font-bold text-text-secondary bg-surface-dim px-2.5 py-1 rounded-full border border-border-soft/50 shadow-soft">
              🗓️ {{ formatDate(entry.date) }}
            </span>
          </div>

          <!-- Exact Time -->
          <div class="text-[11px] font-bold text-text-muted flex items-center gap-1">
            <span>🕒</span>
            <span>{{ formatTime(entry.created_at) }}</span>
            <span v-if="isUpdated" class="text-[10px] text-primary-500 font-semibold">
              ({{ locale === 'id' ? 'Diperbarui' : 'Updated' }})
            </span>
          </div>
        </div>

        <!-- Typography Centered Content -->
        <div class="py-6 space-y-5">
          <!-- Journal Title -->
          <h2 class="text-xl sm:text-2xl font-extrabold text-text-primary tracking-tight leading-snug">
            {{ entry.title || $t('journal.noTitle') }}
          </h2>

          <!-- Journal Body Content -->
          <p class="text-sm sm:text-base text-text-primary/90 leading-relaxed whitespace-pre-wrap font-medium font-sans">
            {{ entry.content }}
          </p>
        </div>

        <!-- Meta info & Actions footer -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-between gap-4 border-t border-border-soft/50 pt-5 mt-4">
          <!-- Updated At label if applicable -->
          <div class="text-[10px] font-semibold text-text-muted">
            <span v-if="isUpdated">
              {{ $t('journal.lastUpdated') }}: {{ formatFullDate(entry.updated_at) }}
            </span>
            <span v-else>
              {{ locale === 'id' ? 'Ditulis pada' : 'Written on' }}: {{ formatFullDate(entry.created_at) }}
            </span>
          </div>

          <!-- Edit & Delete Controls -->
          <div class="flex items-center gap-2.5">
            <!-- Delete button -->
            <SoftButton
              variant="danger"
              size="sm"
              class="font-bold cursor-pointer"
              @click="showDeleteConfirm = true"
            >
              <span>🗑️</span>
              <span>{{ $t('common.delete') }}</span>
            </SoftButton>

            <!-- Edit button -->
            <SoftButton
              variant="outline"
              size="sm"
              class="font-bold border-primary-200/50 text-primary-600 hover:bg-primary-50 cursor-pointer"
              @click="navigateTo(`/journal/write?edit=${entry.id}`)"
            >
              <span>✏️</span>
              <span>{{ $t('common.edit') }}</span>
            </SoftButton>
          </div>
        </div>
      </GlassCard>
    </div>

    <!-- Entry Not Found state -->
    <div v-else class="animate-slide-up stagger-1">
      <EmptyState
        icon="🔍"
        :title="locale === 'id' ? 'Jurnal tidak ditemukan' : 'Journal not found'"
        :description="locale === 'id' ? 'Catatan jurnal ini tidak ada atau telah dihapus.' : 'This journal entry does not exist or has been deleted.'"
        :action-label="$t('journal.back')"
        action-to="/journal"
      />
    </div>

    <!-- Gorgeous Premium Delete Confirmation Modal Overlay -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="showDeleteConfirm"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md"
        @click.self="showDeleteConfirm = false"
      >
        <GlassCard
          variant="frosted"
          padding="lg"
          class="max-w-md w-full border border-danger/20 shadow-float space-y-6 animate-scale-in"
        >
          <!-- Warning Header Icon -->
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-danger/10 flex items-center justify-center text-xl text-danger shadow-soft">
              ⚠️
            </div>
            <div>
              <h3 class="text-sm sm:text-base font-extrabold text-text-primary">
                {{ locale === 'id' ? 'Hapus Jurnal Permanen' : 'Delete Journal Permanently' }}
              </h3>
              <p class="text-xs text-text-muted mt-0.5 font-medium">
                {{ $t('journal.deleteConfirm') }}
              </p>
            </div>
          </div>

          <!-- Warning text -->
          <p class="text-xs text-text-secondary leading-relaxed bg-danger/5 p-3 rounded-xl border border-danger/10">
            {{ locale === 'id' 
              ? 'Tindakan ini bersifat final. Seluruh isi jurnal Anda akan dihapus selamanya dari penyimpanan dan tidak dapat dipulihkan.' 
              : 'This action is final. Your journal entry will be permanently deleted from the system and cannot be restored.' }}
          </p>

          <!-- Buttons -->
          <div class="flex items-center justify-end gap-3.5">
            <SoftButton
              variant="outline"
              size="md"
              class="cursor-pointer"
              @click="showDeleteConfirm = false"
            >
              {{ $t('common.cancel') }}
            </SoftButton>
            <SoftButton
              variant="danger"
              size="md"
              :loading="deleting"
              class="cursor-pointer"
              @click="handleDelete"
            >
              {{ $t('common.delete') }}
            </SoftButton>
          </div>
        </GlassCard>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'

definePageMeta({
  layout: 'default',
  middleware: ['auth'],
})

useHead({
  title: 'Baca Jurnal — RuangTeduh',
})

const route = useRoute()
const { locale, t } = useI18n()
const journalStore = useJournalStore()
const { journals } = storeToRefs(journalStore)

const journalId = computed(() => route.params.id as string)

const loading = ref(true)
const entry = ref<any>(null)

const showDeleteConfirm = ref(false)
const deleting = ref(false)

// Mood colors & emoji
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

const isUpdated = computed(() => {
  if (!entry.value) return false
  const created = new Date(entry.value.created_at).getTime()
  const updated = new Date(entry.value.updated_at).getTime()
  // Allow difference up to 5 seconds due to server time drift
  return (updated - created) > 5000
})

// Date helpers
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

const formatFullDate = (isoString: string) => {
  const date = new Date(isoString)
  return date.toLocaleDateString(locale.value === 'id' ? 'id-ID' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleDelete = async () => {
  if (!entry.value) return
  deleting.value = true
  try {
    await journalStore.deleteJournal(entry.value.id)
    showDeleteConfirm.value = false
    navigateTo('/journal')
  } catch (e) {
    console.error('Failed to delete entry:', e)
  } finally {
    deleting.value = false
  }
}

onMounted(async () => {
  loading.value = true
  try {
    await journalStore.fetchJournals()
    const found = journals.value.find(j => j.id === journalId.value)
    if (found) {
      entry.value = found
    }
  } catch (e) {
    console.error('Error fetching journal:', e)
  } finally {
    loading.value = false
  }
})
</script>
