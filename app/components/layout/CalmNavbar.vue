<template>
  <header class="fixed top-0 left-0 right-0 z-50 glass-strong">
    <div class="max-w-5xl mx-auto px-4 sm:px-6">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <NuxtLink to="/dashboard" class="flex items-center gap-2 group">
          <span class="text-2xl group-hover:animate-breathing">🌿</span>
          <span class="font-bold text-lg text-gradient sm:inline">RuangTeduh</span>
        </NuxtLink>
        <!-- Desktop Nav -->
        <nav class="hidden md:flex items-center gap-1">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-text-secondary transition-all duration-200 hover:bg-primary-50 hover:text-primary-600"
            active-class="!bg-primary-100 !text-primary-600"
          >
            <span class="flex items-center justify-center flex-shrink-0">
              <template v-if="item.icon === 'home'">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
              </template>
              <template v-else-if="item.icon === 'chat'">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 8.511c.084.29.125.597.125.911 0 3.87-4.033 7-9 7H9.897L5.84 19.825c-.476.465-1.29.138-1.29-.523v-2.438C3.513 15.656 3 14.39 3 13c0-3.87 4.033-7 9-7 1.406 0 2.721.258 3.856.711m4.394 1.8c.084.29.125.597.125.911 0 1.39-.513 2.656-1.55 3.862" />
                </svg>
              </template>
              <template v-else-if="item.icon === 'mood'">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
                </svg>
              </template>
              <template v-else-if="item.icon === 'journal'">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </template>
              <template v-else-if="item.icon === 'community'">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </template>
            </span>
            <span>{{ $t(item.labelKey) }}</span>
          </NuxtLink>
        </nav>
        <!-- Right actions -->
        <div class="flex items-center gap-2">
          <!-- Language toggle -->
          <button
            @click="toggleLocale"
            class="p-2 rounded-xl text-sm font-medium text-text-secondary hover:bg-surface-dim transition-colors"
            :title="locale === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'"
          >
            {{ locale === 'id' ? 'EN' : 'ID' }}
          </button>
          <!-- Profile -->
          <template v-if="user || authStore.isGuest">
            <NuxtLink
              v-if="profile"
              to="/profile"
              class="flex items-center gap-2 p-2 rounded-xl hover:bg-surface-dim transition-colors"
            >
              <span class="text-xl">{{ profile.avatar_emoji || '🌿' }}</span>
              <span class="text-sm font-medium text-text-secondary hidden sm:inline">
                {{ profile.username || 'User' }}
              </span>
            </NuxtLink>
            <!-- Premium Loading Skeleton for Header Profile -->
            <div v-else class="flex items-center gap-2 p-2 animate-pulse">
              <div class="w-7 h-7 rounded-full bg-surface-dim flex items-center justify-center text-xs text-text-secondary/20">🌿</div>
              <div class="h-3.5 bg-surface-dim rounded-md w-16 hidden sm:inline-block" />
            </div>
          </template>
          <!-- Login button -->
          <SoftButton v-else variant="primary" size="sm" @click="navigateTo('/auth/login')">
            {{ $t('nav.login') }}
          </SoftButton>
          <!-- Mobile menu toggle -->
          <button
            @click="isMenuOpen = !isMenuOpen"
            class="md:hidden p-2 rounded-xl hover:bg-surface-dim transition-colors"
          >
            <svg v-if="!isMenuOpen" class="w-6 h-6 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg v-else class="w-6 h-6 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
    <!-- Mobile dropdown menu -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="isMenuOpen" class="md:hidden glass-strong border-t border-border-soft">
        <nav class="max-w-5xl mx-auto px-4 py-3 space-y-1">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-text-secondary hover:bg-primary-50 hover:text-primary-600 transition-colors"
            active-class="!bg-primary-100 !text-primary-600"
            @click="isMenuOpen = false"
          >
            <span class="flex items-center justify-center flex-shrink-0">
              <template v-if="item.icon === 'home'">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
              </template>
              <template v-else-if="item.icon === 'chat'">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 8.511c.084.29.125.597.125.911 0 3.87-4.033 7-9 7H9.897L5.84 19.825c-.476.465-1.29.138-1.29-.523v-2.438C3.513 15.656 3 14.39 3 13c0-3.87 4.033-7 9-7 1.406 0 2.721.258 3.856.711m4.394 1.8c.084.29.125.597.125.911 0 1.39-.513 2.656-1.55 3.862" />
                </svg>
              </template>
              <template v-else-if="item.icon === 'mood'">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
                </svg>
              </template>
              <template v-else-if="item.icon === 'journal'">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </template>
              <template v-else-if="item.icon === 'community'">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </template>
            </span>
            <span>{{ $t(item.labelKey) }}</span>
          </NuxtLink>
        </nav>
      </div>
    </Transition>
  </header>
</template>
<script setup lang="ts">
    import { storeToRefs } from 'pinia'
    const { locale, setLocale } = useI18n()
    const user = useSupabaseUser()

    const authStore = useAuthStore()
    const { profile } = storeToRefs(authStore)
    const isMenuOpen = ref(false)
    const navItems = [
      { to: '/dashboard', icon: 'home', labelKey: 'nav.home' },
      { to: '/chat', icon: 'chat', labelKey: 'nav.chat' },
      { to: '/mood', icon: 'mood', labelKey: 'nav.mood' },
      { to: '/journal', icon: 'journal', labelKey: 'journal.title' },
      { to: '/community', icon: 'community', labelKey: 'nav.community' },
    ]
    const toggleLocale = () => {
    setLocale(locale.value === 'id' ? 'en' : 'id')
    }
    // Close mobile menu on route change
    const route = useRoute()
    watch(() => route.path, () => {
    isMenuOpen.value = false
    })
</script>