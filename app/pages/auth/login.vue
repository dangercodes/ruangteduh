<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Logo -->
    <div class="text-center space-y-3">
      <div class="flex justify-center">
        <img src="../../assets/images/logo.png" alt="Logo" class="w-28 h-28 rounded-3xl object-cover items-center justify-center">
      </div>
      <div>
        <h1 class="text-2xl font-bold text-text-primary">{{ $t('auth.login.title') }}</h1>
        <p class="text-sm text-text-secondary mt-1">{{ $t('auth.login.subtitle') }}</p>
      </div>
    </div>

    <!-- Login Form -->
    <GlassCard variant="frosted" padding="lg">
      <form @submit.prevent="handleLogin" class="space-y-4">
        <!-- Email -->
        <div class="space-y-1.5">
          <label for="email" class="text-sm font-medium text-text-secondary">
            {{ $t('auth.login.email') }}
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            class="w-full px-4 py-3 bg-surface-dim rounded-xl border-0 text-sm text-text-primary placeholder-text-muted focus:ring-2 focus:ring-primary-300 focus:bg-white transition-all"
            placeholder="nama@email.com"
          />
        </div>

        <!-- Password -->
        <div class="space-y-1.5">
          <label for="password" class="text-sm font-medium text-text-secondary">
            {{ $t('auth.login.password') }}
          </label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            class="w-full px-4 py-3 bg-surface-dim rounded-xl border-0 text-sm text-text-primary placeholder-text-muted focus:ring-2 focus:ring-primary-300 focus:bg-white transition-all"
            placeholder="••••••••"
          />
        </div>

        <!-- Error -->
        <p v-if="error" class="text-sm text-danger text-center animate-scale-in">
          {{ error }}
        </p>

        <!-- Submit -->
        <SoftButton
          type="submit"
          variant="primary"
          size="lg"
          class="w-full"
          :loading="loading"
        >
          {{ $t('auth.login.submit') }}
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
          Masuk sebagai Tamu 🍃
        </SoftButton>
      </form>
    </GlassCard>

    <!-- Register link -->
    <p class="text-center text-sm text-text-secondary">
      {{ $t('auth.login.noAccount') }}
      <NuxtLink to="/auth/register" class="text-primary-500 font-medium hover:text-primary-600 transition-colors">
        {{ $t('auth.login.register') }}
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
  title: 'Masuk — RuangTeduh',
})

const authStore = useAuthStore()
const { loading, error } = storeToRefs(authStore)

const email = ref('')
const password = ref('')

const handleLogin = () => {
  authStore.login(email.value, password.value)
}

const handleGuestLogin = () => {
  authStore.loginGuest()
}
</script>
