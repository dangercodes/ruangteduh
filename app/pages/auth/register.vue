<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Logo -->
    <div class="text-center space-y-3">
      <div class="flex justify-center">
        <img src="../../assets/images/logo.png" alt="Logo" class="w-28 h-28 rounded-3xl object-cover items-center justify-center">
      </div>
      <div>
        <h1 class="text-2xl font-bold text-text-primary">{{ $t('auth.register.title') }}</h1>
        <p class="text-sm text-text-secondary mt-1">{{ $t('auth.register.subtitle') }}</p>
      </div>
    </div>

    <!-- Verification Sent Success State -->
    <GlassCard v-if="registrationSuccess" variant="frosted" padding="lg" class="text-center space-y-6 animate-scale-in">
      <div class="flex justify-center">
        <div class="w-20 h-20 bg-primary-50 rounded-2xl flex items-center justify-center text-4xl animate-breathing shadow-sm border border-primary-100">
          📨
        </div>
      </div>
      <div class="space-y-2">
        <h2 class="text-xl font-bold text-text-primary">
          {{ $t('auth.register.verificationSentTitle') }}
        </h2>
        <p class="text-sm text-text-secondary leading-relaxed">
          {{ $t('auth.register.verificationSentSubtitle', { email }) }}
        </p>
      </div>
      <SoftButton
        variant="primary"
        size="lg"
        class="w-full"
        @click="navigateToLogin"
      >
        {{ $t('auth.register.backToLogin') }}
      </SoftButton>
    </GlassCard>

    <!-- Register Form -->
    <GlassCard v-else variant="frosted" padding="lg">
      <form @submit.prevent="handleRegister" class="space-y-4">
        <!-- Email -->
        <div class="space-y-1.5">
          <label for="reg-email" class="text-sm font-medium text-text-secondary">
            {{ $t('auth.register.email') }}
          </label>
          <input
            id="reg-email"
            v-model="email"
            type="email"
            required
            class="w-full px-4 py-3 bg-surface-dim rounded-xl border-0 text-sm text-text-primary placeholder-text-muted focus:ring-2 focus:ring-primary-300 focus:bg-white transition-all"
            placeholder="nama@email.com"
          />
        </div>

        <!-- Password -->
        <div class="space-y-1.5">
          <label for="reg-password" class="text-sm font-medium text-text-secondary">
            {{ $t('auth.register.password') }}
          </label>
          <input
            id="reg-password"
            v-model="password"
            type="password"
            required
            minlength="6"
            class="w-full px-4 py-3 bg-surface-dim rounded-xl border-0 text-sm text-text-primary placeholder-text-muted focus:ring-2 focus:ring-primary-300 focus:bg-white transition-all"
            placeholder="Minimal 6 karakter"
          />
        </div>

        <!-- Confirm Password -->
        <div class="space-y-1.5">
          <label for="reg-confirm" class="text-sm font-medium text-text-secondary">
            {{ $t('auth.register.confirmPassword') }}
          </label>
          <input
            id="reg-confirm"
            v-model="confirmPassword"
            type="password"
            required
            class="w-full px-4 py-3 bg-surface-dim rounded-xl border-0 text-sm text-text-primary placeholder-text-muted focus:ring-2 focus:ring-primary-300 focus:bg-white transition-all"
            placeholder="Konfirmasi password"
          />
        </div>

        <!-- Error -->
        <p v-if="errorMessage" class="text-sm text-danger text-center animate-scale-in">
          {{ errorMessage }}
        </p>

        <!-- Submit -->
        <SoftButton
          type="submit"
          variant="primary"
          size="lg"
          class="w-full"
          :loading="loading"
        >
          {{ $t('auth.register.submit') }}
        </SoftButton>

        <!-- Divider -->
        <div class="relative flex py-2 items-center">
          <div class="flex-grow border-t border-text-secondary/20"></div>
          <span class="flex-shrink mx-4 text-xs text-text-secondary/60">atau</span>
          <div class="flex-grow border-t border-text-secondary/20"></div>
        </div>

        <!-- Guest Login Button -->
        <SoftButton
          type="button"
          variant="secondary"
          size="lg"
          class="w-full flex items-center justify-center gap-2 border border-text-secondary/10 hover:border-primary-300 hover:bg-primary-50/20 text-primary-600 hover:text-primary-700 transition-all duration-300"
          :loading="loading"
          @click="handleGuestLogin"
        >
          Coba Mode Tamu 🍃
        </SoftButton>
      </form>
    </GlassCard>

    <!-- Login link -->
    <p v-if="!registrationSuccess" class="text-center text-sm text-text-secondary">
      {{ $t('auth.register.hasAccount') }}
      <NuxtLink to="/auth/login" class="text-primary-500 font-medium hover:text-primary-600 transition-colors">
        {{ $t('auth.register.login') }}
      </NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'

definePageMeta({
  layout: 'auth',
  middleware: ['guest'],
})

useHead({
  title: 'Daftar — RuangTeduh',
})

const authStore = useAuthStore()
const { loading, error, registrationSuccess } = storeToRefs(authStore)

const email = ref('')
const password = ref('')
const confirmPassword = ref('')

const errorMessage = computed(() => {
  if (password.value && confirmPassword.value && password.value !== confirmPassword.value) {
    return 'Password tidak cocok'
  }
  return error.value
})

const handleRegister = () => {
  if (password.value !== confirmPassword.value) return
  authStore.register(email.value, password.value)
}

const handleGuestLogin = () => {
  authStore.loginGuest()
}

const navigateToLogin = () => {
  authStore.registrationSuccess = false
  navigateTo('/auth/login')
}

onUnmounted(() => {
  authStore.registrationSuccess = false
})
</script>
