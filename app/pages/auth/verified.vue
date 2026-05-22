<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Logo -->
    <div class="text-center space-y-3">
      <div class="flex justify-center">
        <img src="../../assets/images/logo.png" alt="Logo" class="w-28 h-28 rounded-3xl object-cover items-center justify-center">
      </div>
      <div>
        <h1 class="text-2xl font-bold text-text-primary">{{ $t('app.name') }}</h1>
        <p class="text-sm text-text-secondary mt-1">{{ $t('app.tagline') }}</p>
      </div>
    </div>

    <!-- Verified Success Card -->
    <GlassCard variant="frosted" padding="lg" class="text-center space-y-6">
      <!-- Loading state -->
      <div v-if="pageLoading" class="py-8 space-y-4 flex flex-col items-center">
        <div class="w-12 h-12 border-4 border-primary-100 border-t-primary-500 rounded-full animate-spin"></div>
        <p class="text-sm text-text-secondary animate-pulse">{{ $t('auth.verified.loading') }}</p>
      </div>

      <!-- Content state -->
      <div v-else class="space-y-6 animate-scale-in">
        <div class="flex justify-center">
          <div class="w-20 h-20 bg-emerald-50/80 rounded-2xl flex items-center justify-center text-4xl animate-breathing shadow-sm border border-emerald-100">
            🌱
          </div>
        </div>
        
        <div class="space-y-2">
          <h2 class="text-xl font-bold text-text-primary">
            {{ $t('auth.verified.title') }}
          </h2>
          <p class="text-sm text-text-secondary leading-relaxed">
            {{ $t('auth.verified.subtitle') }}
          </p>
          <div v-if="user" class="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 rounded-full text-xs font-medium text-emerald-600 mt-2">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            {{ $t('auth.verified.success') }}
          </div>
        </div>

        <SoftButton
          variant="primary"
          size="lg"
          class="w-full"
          @click="ctaAction"
        >
          {{ $t(ctaLabelKey) }}
        </SoftButton>
      </div>
    </GlassCard>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'

definePageMeta({
  layout: 'auth',
})

useHead({
  title: 'Email Terverifikasi — RuangTeduh',
})

const authStore = useAuthStore()
const { user, profile } = storeToRefs(authStore)
const pageLoading = ref(true)

onMounted(async () => {
  pageLoading.value = true
  try {
    // Wait briefly for Supabase to hydrate the user ref (up to 1.5 seconds)
    if (!user.value) {
      await new Promise<void>((resolve) => {
        const check = () => {
          if (user.value) {
            resolve()
            return true
          }
          return false
        }
        if (check()) return

        const unwatch = watch(user, (newUser) => {
          if (newUser) {
            unwatch()
            resolve()
          }
        })

        setTimeout(() => {
          unwatch()
          resolve()
        }, 1500)
      })
    }

    if (user.value) {
      await authStore.fetchProfile(true)
    }
  } catch (err) {
    console.error('Failed checking verification profile state:', err)
  } finally {
    pageLoading.value = false
  }
})

const ctaAction = () => {
  if (!user.value) {
    navigateTo('/auth/login')
  } else if (!profile.value?.username) {
    navigateTo('/onboarding')
  } else {
    navigateTo('/dashboard')
  }
}

const ctaLabelKey = computed(() => {
  if (!user.value) {
    return 'auth.verified.ctaLogin'
  } else if (!profile.value?.username) {
    return 'auth.verified.ctaOnboarding'
  } else {
    return 'auth.verified.ctaDashboard'
  }
})
</script>
