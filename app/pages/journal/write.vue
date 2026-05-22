<template>
  <div class="max-w-2xl mx-auto space-y-6 pb-12">
    <!-- Header -->
    <div class="animate-slide-up flex items-center justify-between border-b border-border-soft/60 pb-4">
      <div>
        <h1 class="text-xl sm:text-2xl font-extrabold text-text-primary tracking-tight">
          {{ isEditing ? $t('journal.editEntry') : $t('journal.newEntry') }}
        </h1>
        <p class="text-xs text-text-muted mt-1 font-medium">
          {{ isEditing ? $t('journal.lastUpdated') : $t('app.tagline') }}
        </p>
      </div>
      <SoftButton variant="ghost" size="sm" class="cursor-pointer" @click="handleCancel">
        ✕ {{ $t('common.cancel') }}
      </SoftButton>
    </div>

    <!-- Editor Panel Card -->
    <GlassCard variant="frosted" padding="lg" class="animate-slide-up stagger-1 border border-white/60 shadow-medium">
      <form @submit.prevent="handleSave" class="space-y-6">
        <!-- Title Input -->
        <div class="space-y-1.5">
          <label class="text-xs font-extrabold text-text-secondary uppercase tracking-wider">
            {{ $t('journal.form.titleLabel') }}
          </label>
          <input
            v-model="title"
            type="text"
            :placeholder="$t('journal.form.titlePlaceholder')"
            maxlength="100"
            class="w-full px-4 py-3 bg-surface-dim/40 rounded-xl border border-border-soft text-sm text-text-primary placeholder-text-muted/60 focus:ring-2 focus:ring-primary-500 focus:bg-white focus:border-primary-500 transition-all shadow-inner"
          />
        </div>

        <!-- Content Area -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <label class="text-xs font-extrabold text-text-secondary uppercase tracking-wider">
              {{ $t('journal.form.contentLabel') }}
            </label>
            <span 
              class="text-[10px] font-bold"
              :class="content.length > 5000 ? 'text-danger animate-pulse' : 'text-text-muted'"
            >
              {{ content.length }} / 5000
            </span>
          </div>
          <textarea
            v-model="content"
            rows="10"
            :placeholder="$t('journal.form.contentPlaceholder')"
            class="w-full px-4 py-3 bg-surface-dim/40 rounded-xl border border-border-soft text-sm text-text-primary placeholder-text-muted/60 focus:ring-2 focus:ring-primary-500 focus:bg-white focus:border-primary-500 transition-all resize-none shadow-inner"
            @input="clearError"
          />
        </div>

        <!-- Mood Selector Tag -->
        <div class="space-y-2">
          <label class="text-xs font-extrabold text-text-secondary uppercase tracking-wider block">
            {{ $t('journal.form.moodLabel') }}
          </label>
          <div class="flex flex-wrap gap-2 pt-1">
            <button
              v-for="(val, key) in moodConfig"
              :key="key"
              type="button"
              @click="toggleMoodTag(key)"
              class="px-3 py-2 rounded-2xl border text-xs font-semibold flex items-center gap-1.5 transition-all duration-300 hover:scale-105 cursor-pointer"
              :style="{
                borderColor: selectedMood === key ? val.color : 'rgba(226, 232, 240, 0.6)',
                backgroundColor: selectedMood === key ? val.color + '15' : 'rgba(255, 255, 255, 0.4)',
                color: selectedMood === key ? val.color : 'var(--color-text-secondary)'
              }"
            >
              <span class="text-base">{{ val.emoji }}</span>
              <span>{{ $t(`mood.emotions.${key}`) }}</span>
            </button>
          </div>
        </div>

        <!-- Error Message Bar -->
        <div 
          v-if="errorMsg" 
          class="p-3.5 bg-danger/10 border border-danger/25 text-danger rounded-xl text-xs font-bold animate-scale-in flex items-center gap-2"
        >
          <span>🍃</span>
          <span class="flex-1">{{ errorMsg }}</span>
          <button @click="errorMsg = ''" type="button" class="opacity-60 hover:opacity-100 cursor-pointer">✕</button>
        </div>

        <!-- Submission Buttons -->
        <div class="flex items-center justify-end gap-3 border-t border-border-soft/40 pt-5 mt-4">
          <SoftButton 
            variant="outline" 
            size="md" 
            type="button"
            class="w-full sm:w-auto cursor-pointer"
            @click="handleCancel"
          >
            {{ $t('common.cancel') }}
          </SoftButton>
          <SoftButton
            variant="primary"
            size="md"
            type="submit"
            :loading="saving"
            class="shadow-glow-primary w-full sm:w-auto cursor-pointer"
          >
            <span>{{ isEditing ? $t('journal.form.saveChanges') : $t('journal.form.submit') }}</span>
          </SoftButton>
        </div>
      </form>
    </GlassCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { MoodType } from '~/types'

definePageMeta({
  layout: 'default',
  middleware: ['auth'],
})

useHead({
  title: 'Tulis Jurnal — RuangTeduh',
})

const route = useRoute()
const { t } = useI18n()
const journalStore = useJournalStore()

const isEditing = computed(() => !!route.query.edit)
const editId = computed(() => route.query.edit as string)

const title = ref('')
const content = ref('')
const selectedMood = ref<MoodType | null>(null)

const saving = ref(false)
const errorMsg = ref('')

// Mood settings mapping
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

const toggleMoodTag = (mood: any) => {
  selectedMood.value = selectedMood.value === mood ? null : mood
}

const clearError = () => {
  errorMsg.value = ''
}

const handleCancel = () => {
  if (isEditing.value) {
    navigateTo(`/journal/${editId.value}`)
  } else {
    navigateTo('/journal')
  }
}

const handleSave = async () => {
  // Trim fields
  const trimmedTitle = title.value.trim()
  const trimmedContent = content.value.trim()

  if (!trimmedContent) {
    errorMsg.value = t('journal.form.errorEmpty') || 'Isi jurnal tidak boleh kosong. 🍃'
    return
  }

  if (trimmedContent.length > 5000) {
    errorMsg.value = t('journal.form.errorTooLong') || 'Isi jurnal maksimal 5000 karakter. 🍃'
    return
  }

  saving.value = true
  errorMsg.value = ''

  try {
    await journalStore.submitJournal(
      trimmedTitle || null,
      trimmedContent,
      selectedMood.value,
      isEditing.value ? editId.value : undefined
    )
    navigateTo('/journal')
  } catch (e: any) {
    console.error('Failed to save journal:', e)
    errorMsg.value = e.message || t('common.error')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  if (isEditing.value) {
    // Wait for store initialization
    await journalStore.fetchJournals()
    
    // Find entry
    const entry = journalStore.journals.find(j => j.id === editId.value)
    if (entry) {
      title.value = entry.title || ''
      content.value = entry.content || ''
      selectedMood.value = entry.mood_tag as MoodType | null
    } else {
      navigateTo('/journal')
    }
  }
})
</script>
