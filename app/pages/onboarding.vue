<template>
  <div class="space-y-8 animate-fade-in">
    <!-- Step indicators -->
    <div class="flex justify-center gap-2">
      <div
        v-for="i in 3"
        :key="i"
        class="w-2.5 h-2.5 rounded-full transition-all duration-300"
        :class="step >= i ? 'bg-primary-500 scale-110' : 'bg-border-soft'"
      />
    </div>

    <!-- Step 1: Welcome -->
    <div v-if="step === 1" class="text-center space-y-6 animate-scale-in">
      <div class="flex justify-center">
        <img src="../assets/images/logo.png" alt="Logo" class="w-32 h-32 rounded-3xl object-cover items-center justify-center animate-breathing">
      </div>
      <div class="space-y-2">
        <h1 class="text-2xl font-bold text-text-primary">{{ $t('onboarding.welcome.title') }}</h1>
        <p class="text-sm text-text-secondary">{{ $t('onboarding.welcome.subtitle') }}</p>
      </div>
      <SoftButton variant="primary" size="lg" @click="step = 2">
        {{ $t('common.next') }}
      </SoftButton>
    </div>

    <!-- Step 2: Username & Avatar -->
    <div v-if="step === 2" class="space-y-6 animate-scale-in">
      <div class="text-center space-y-2">
        <h2 class="text-xl font-bold text-text-primary">{{ $t('onboarding.username.title') }}</h2>
        <p class="text-sm text-text-secondary">{{ $t('onboarding.username.subtitle') }}</p>
      </div>

      <GlassCard variant="frosted" padding="lg">
        <div class="space-y-4">
          <input
            v-model="username"
            type="text"
            :placeholder="$t('onboarding.username.placeholder')"
            class="w-full px-4 py-3 bg-surface-dim rounded-xl border-0 text-sm text-text-primary placeholder-text-muted focus:ring-2 focus:ring-primary-300 focus:bg-white transition-all text-center"
            maxlength="20"
          />
          <p class="text-xs text-text-muted text-center">{{ $t('onboarding.username.hint') }}</p>
        </div>
      </GlassCard>

      <!-- Avatar selection -->
      <div class="text-center space-y-3">
        <h3 class="text-sm font-medium text-text-secondary">{{ $t('onboarding.avatar.title') }}</h3>
        <div class="flex flex-wrap justify-center gap-3">
          <button
            v-for="emoji in avatarEmojis"
            :key="emoji"
            @click="selectedEmoji = emoji"
            class="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-all duration-200"
            :class="selectedEmoji === emoji
              ? 'bg-primary-100 scale-110 shadow-medium ring-2 ring-primary-300'
              : 'bg-white/50 hover:bg-white/80 hover:scale-105'"
          >
            {{ emoji }}
          </button>
        </div>
      </div>

      <!-- Error -->
      <p v-if="error" class="text-sm text-danger text-center animate-scale-in">
        {{ error }}
      </p>

      <div class="flex gap-3">
        <SoftButton variant="ghost" size="lg" @click="step = 1" class="flex-1">
          {{ $t('common.back') }}
        </SoftButton>
        <SoftButton
          variant="primary"
          size="lg"
          class="flex-1"
          :disabled="!username.trim()"
          @click="completeOnboarding"
          :loading="saving"
        >
          {{ $t('common.next') }}
        </SoftButton>
      </div>
    </div>

    <!-- Step 3: Complete -->
    <div v-if="step === 3" class="text-center space-y-6 animate-scale-in">
      <div class="text-6xl animate-breathing">🎉</div>
      <div class="space-y-2">
        <h2 class="text-2xl font-bold text-text-primary">{{ $t('onboarding.complete.title') }}</h2>
        <p class="text-sm text-text-secondary">{{ $t('onboarding.complete.subtitle') }}</p>
      </div>
      <SoftButton variant="primary" size="xl" @click="goToDashboard">
        {{ $t('onboarding.complete.cta') }}
      </SoftButton>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  middleware: ['auth'],
})

useHead({
  title: 'Onboarding — RuangTeduh',
})

const profileStore = useProfileStore()

const goToDashboard = () => {
  navigateTo('/dashboard')
}

const step = ref(1)
const username = ref('')
const selectedEmoji = ref('🌿')
const saving = ref(false)
const error = ref<string | null>(null)

const avatarEmojis = ['🌿', '🌸', '🌙', '☀️', '🦋', '🐱', '🐻', '🌈', '⭐', '🍀', '🌺', '🎭']

const completeOnboarding = async () => {
  if (!username.value.trim()) return
  saving.value = true
  error.value = null
  try {
    await profileStore.createProfile(username.value.trim(), selectedEmoji.value)
    step.value = 3
  } catch (e: any) {
    console.error('Onboarding failed:', e)
    if (e.message?.includes('profiles_username_key') || e.code === '23505') {
      error.value = 'Nama anonim ini sudah digunakan. Silakan pilih nama lain.'
    } else {
      error.value = e.message || 'Gagal menyimpan profil. Silakan coba lagi.'
    }
  } finally {
    saving.value = false
  }
}
</script>
