<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="animate-slide-up">
      <h1 class="text-2xl font-bold text-text-primary">{{ $t('settings.title') }}</h1>
    </div>

    <!-- Language -->
    <GlassCard variant="solid" padding="md" class="animate-slide-up stagger-1">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="text-xl">🌐</span>
          <span class="text-sm font-medium text-text-primary">{{ $t('settings.language') }}</span>
        </div>
        <select
          :value="locale"
          @change="handleLocaleChange"
          class="px-3 py-2 bg-surface-dim rounded-xl border-0 text-sm text-text-primary focus:ring-2 focus:ring-primary-300 transition-all"
        >
          <option value="id">Bahasa Indonesia</option>
          <option value="en">English</option>
        </select>
      </div>
    </GlassCard>

    <!-- Notifications -->
    <GlassCard variant="solid" padding="md" class="animate-slide-up stagger-2">
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="text-xl">🔔</span>
            <span class="text-sm font-medium text-text-primary">{{ $t('settings.moodReminder') }}</span>
          </div>
          <button
            @click="moodReminder = !moodReminder"
            class="relative w-12 h-7 rounded-full transition-colors duration-300"
            :class="moodReminder ? 'bg-primary-500' : 'bg-border-soft'"
          >
            <span
              class="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-soft transition-transform duration-300"
              :class="moodReminder ? 'translate-x-5' : 'translate-x-0.5'"
            />
          </button>
        </div>
      </div>
    </GlassCard>

    <!-- About -->
    <GlassCard variant="solid" padding="md" class="animate-slide-up stagger-3">
      <div class="space-y-3">
        <button class="w-full flex items-center justify-between py-2 text-sm text-text-primary hover:text-primary-500 transition-colors">
          <div class="flex items-center gap-3">
            <span class="text-xl">ℹ️</span>
            <span>{{ $t('settings.about') }}</span>
          </div>
          <svg class="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <div class="border-t border-border-soft/50" />
        <button class="w-full flex items-center justify-between py-2 text-sm text-text-primary hover:text-primary-500 transition-colors">
          <div class="flex items-center gap-3">
            <span class="text-xl">🔒</span>
            <span>{{ $t('settings.privacy') }}</span>
          </div>
          <svg class="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <div class="border-t border-border-soft/50" />
        <button class="w-full flex items-center justify-between py-2 text-sm text-text-primary hover:text-primary-500 transition-colors">
          <div class="flex items-center gap-3">
            <span class="text-xl">📜</span>
            <span>{{ $t('settings.terms') }}</span>
          </div>
          <svg class="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </GlassCard>

    <!-- Danger Zone -->
    <GlassCard variant="outline" padding="md" class="animate-slide-up stagger-4">
      <div class="space-y-3">
        <div class="flex items-center gap-3">
          <span class="text-xl">⚠️</span>
          <span class="text-sm font-medium text-danger">{{ $t('settings.deleteAccount') }}</span>
        </div>
        <p class="text-xs text-text-muted">{{ $t('settings.deleteWarning') }}</p>
        <SoftButton variant="danger" size="sm">
          {{ $t('settings.deleteAccount') }}
        </SoftButton>
      </div>
    </GlassCard>

    <!-- App Info -->
    <div class="text-center py-4 animate-fade-in">
      <p class="text-xs text-text-muted">RuangTeduh v1.0.0</p>
      <p class="text-xs text-text-muted mt-1">{{ $t('app.tagline') }} 🌿</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: ['auth'],
})

useHead({
  title: 'Pengaturan — RuangTeduh',
})

const { locale, setLocale } = useI18n()
const moodReminder = ref(true)

const handleLocaleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  setLocale(target.value)
}
</script>
