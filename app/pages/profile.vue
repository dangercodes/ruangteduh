<template>
  <div class="max-w-6xl mx-auto py-2 px-1">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      <!-- LEFT COLUMN: Member Card & Edit Profile Form (Col Span 5) -->
      <div class="lg:col-span-5 space-y-6">
        
        <!-- Profile Header / Member Card -->
        <GlassCard variant="frosted" padding="md" class="relative overflow-hidden animate-slide-up group border border-white/40">
          <!-- Ambient gradient background blob -->
          <div class="absolute -right-16 -top-16 w-36 h-36 bg-gradient-to-br from-primary-200/30 via-lavender-200/20 to-calm-200/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700"></div>
          
          <div class="flex flex-col items-center text-center py-4 relative z-10">
            <!-- Breathing Avatar with Gradient Ring -->
            <div class="relative mb-4 group/avatar">
              <!-- Glow backdrop -->
              <div class="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-primary-400 via-lavender-400 to-calm-400 opacity-30 blur-md group-hover/avatar:opacity-60 transition-opacity duration-300 animate-pulse-gentle"></div>
              
              <!-- Avatar Circle Border -->
              <div class="relative w-24 h-24 rounded-full bg-gradient-to-tr from-primary-400 via-lavender-400 to-calm-400 p-[3px] shadow-medium group-hover/avatar:rotate-12 transition-transform duration-500 ease-calm">
                <div class="w-full h-full rounded-full bg-white flex items-center justify-center text-4xl shadow-inner animate-breathing">
                  {{ profile?.avatar_emoji || '🌿' }}
                </div>
              </div>
            </div>

            <!-- Username & Membership -->
            <h1 class="text-2xl font-extrabold text-text-primary tracking-tight">
              {{ profile?.username || 'User' }}
            </h1>
            
            <div v-if="profile?.created_at" class="flex items-center gap-1.5 mt-2 text-xs text-text-secondary bg-white/50 px-3 py-1 rounded-full border border-white/80 shadow-soft">
              <!-- Calendar Icon -->
              <svg class="w-3.5 h-3.5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>
                {{ $t('profile.memberSince') }} {{ new Date(profile.created_at).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) }}
              </span>
            </div>
          </div>
        </GlassCard>

        <!-- Edit Profile Panel -->
        <GlassCard variant="frosted" padding="md" class="animate-slide-up stagger-1 border border-white/30">
          <div class="space-y-5">
            <div class="flex items-center gap-2 border-b border-border-soft pb-3">
              <div class="p-1.5 bg-primary-50 rounded-lg text-primary-500">
                <!-- User edit SVG -->
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 class="text-sm font-bold text-text-primary tracking-wide uppercase">{{ $t('profile.editProfile') }}</h2>
            </div>

            <!-- Fields -->
            <div class="space-y-4">
              <!-- Username input -->
              <div class="space-y-1.5">
                <div class="flex justify-between items-center">
                  <label class="text-xs font-semibold text-text-secondary">Username</label>
                  <span class="text-[10px] text-text-muted font-mono">{{ editUsername.length }}/20</span>
                </div>
                <div class="relative">
                  <input
                    v-model="editUsername"
                    type="text"
                    maxlength="20"
                    placeholder="Masukkan username..."
                    class="w-full px-4 py-2.5 bg-surface-dim rounded-xl border border-border-soft text-sm text-text-primary focus:bg-white transition-all shadow-inner focus:border-primary-500"
                  />
                </div>
              </div>

              <!-- Avatar grid picker -->
              <div class="space-y-2">
                <label class="text-xs font-semibold text-text-secondary">Pilih Avatar</label>
                <div class="grid grid-cols-4 gap-2.5">
                  <button
                    v-for="emoji in avatarEmojis"
                    :key="emoji"
                    @click="editEmoji = emoji"
                    type="button"
                    class="w-11 h-11 rounded-xl flex items-center justify-center text-2xl transition-all duration-200 border cursor-pointer select-none"
                    :class="editEmoji === emoji
                      ? 'bg-primary-50/80 border-primary-400 ring-2 ring-primary-300/40 scale-110 shadow-glow-primary font-bold'
                      : 'bg-white/60 border-border-soft hover:bg-white hover:scale-105 hover:border-primary-200'"
                  >
                    {{ emoji }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Submit Button & Success Message -->
            <div class="space-y-2 pt-2">
              <SoftButton
                variant="primary"
                class="w-full shadow-soft"
                :loading="saving"
                :disabled="!hasChanges"
                @click="handleUpdateProfile"
              >
                {{ $t('common.save') }}
              </SoftButton>
              
              <transition name="scale">
                <div v-if="saveSuccess" class="flex items-center justify-center gap-1.5 text-xs font-medium text-success py-1.5 bg-success/5 rounded-lg border border-success/10 animate-scale-in">
                  <svg class="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{{ $t('common.success') }}</span>
                </div>
              </transition>
            </div>
          </div>
        </GlassCard>

        <!-- Logout Action -->
        <div class="pt-2 animate-slide-up stagger-4">
          <SoftButton variant="danger" class="w-full flex items-center justify-center gap-2 border border-danger/10 hover:shadow-glow-lavender" @click="handleLogout">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>{{ $t('nav.logout') }}</span>
          </SoftButton>
        </div>

      </div>

      <!-- RIGHT COLUMN: Mood Statistics & Saved Chats History (Col Span 7) -->
      <div class="lg:col-span-7 space-y-8">
        
        <!-- Mood Statistics Section -->
        <div class="animate-slide-up stagger-2">
          <div class="flex items-center gap-2 mb-4">
            <div class="p-1.5 bg-lavender-50 rounded-lg text-lavender-500">
              <!-- Statistics SVG -->
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
              </svg>
            </div>
            <h2 class="text-lg font-bold text-text-primary tracking-tight">{{ $t('profile.moodStats') }}</h2>
          </div>

          <!-- Dynamic Statistics Grid -->
          <div v-if="moodStats" class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <!-- Total Entries -->
            <GlassCard variant="solid" padding="md" class="relative overflow-hidden group hover:shadow-glow-primary transition-all duration-300 border border-white/60">
              <div class="absolute -right-6 -bottom-6 w-16 h-16 bg-primary-100/20 rounded-full blur-xl group-hover:bg-primary-200/30 transition-all duration-500"></div>
              <div class="flex items-start justify-between relative z-10">
                <div class="space-y-1">
                  <p class="text-3xl font-extrabold text-primary-500 tracking-tight">{{ moodStats.total }}</p>
                  <p class="text-xs font-semibold text-text-secondary">{{ $t('profile.totalEntries') }}</p>
                </div>
                <div class="p-2 bg-primary-50 rounded-xl text-primary-500 shadow-soft">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
            </GlassCard>

            <!-- Average Mood -->
            <GlassCard variant="solid" padding="md" class="relative overflow-hidden group hover:shadow-glow-lavender transition-all duration-300 border border-white/60">
              <div class="absolute -right-6 -bottom-6 w-16 h-16 bg-lavender-100/20 rounded-full blur-xl group-hover:bg-lavender-200/30 transition-all duration-500"></div>
              <div class="flex items-start justify-between relative z-10">
                <div class="space-y-1">
                  <p class="text-3xl font-extrabold text-lavender-500 tracking-tight">{{ moodStats.average.toFixed(1) }}</p>
                  <p class="text-xs font-semibold text-text-secondary">{{ $t('profile.avgMood') }}</p>
                </div>
                <div class="p-2 bg-lavender-50 rounded-xl text-lavender-500 shadow-soft">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </GlassCard>

            <!-- Current Streak -->
            <GlassCard variant="solid" padding="md" class="relative overflow-hidden group hover:shadow-glow-primary transition-all duration-300 border border-white/60">
              <div class="absolute -right-6 -bottom-6 w-16 h-16 bg-calm-100/20 rounded-full blur-xl group-hover:bg-calm-200/30 transition-all duration-500"></div>
              <div class="flex items-start justify-between relative z-10">
                <div class="space-y-1">
                  <p class="text-3xl font-extrabold text-calm-500 tracking-tight flex items-center gap-1">
                    <span>{{ moodStats.streak }}</span>
                    <span class="text-2xl animate-pulse">🔥</span>
                  </p>
                  <p class="text-xs font-semibold text-text-secondary">{{ $t('profile.currentStreak') }}</p>
                </div>
                <div class="p-2 bg-calm-50 rounded-xl text-calm-500 shadow-soft">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </GlassCard>

          </div>

          <div v-else class="py-4">
            <LoadingSkeleton variant="mood" />
          </div>
        </div>

        <!-- Recent Mood Section -->
        <div class="animate-slide-up stagger-3">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <div class="p-1.5 bg-lavender-50 rounded-lg text-lavender-500">
                <!-- Smile Face SVG -->
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 class="text-lg font-bold text-text-primary tracking-tight">
                {{ $t('dashboard.recentMood.title') }}
              </h2>
            </div>
            
            <NuxtLink to="/mood" class="group flex items-center gap-0.5 text-xs font-bold text-primary-500 hover:text-primary-600 transition-colors">
              <span>{{ $t('common.seeAll') }}</span>
              <svg class="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </NuxtLink>
          </div>

          <div v-if="moods.length === 0" class="border border-dashed border-border-soft rounded-2xl bg-white/40 p-1">
            <EmptyState
              icon="🌱"
              :title="$t('dashboard.recentMood.empty')"
              :description="$t('empty.general.description')"
              :action-label="$t('dashboard.quickActions.mood')"
              action-to="/mood"
            />
          </div>
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MoodCard
              v-for="entry in moods.slice(0, 4)"
              :key="entry.id"
              :entry="entry"
              class="border border-white/60 hover:shadow-glow-primary transition-all duration-300 bg-white/60 hover:bg-white"
            />
          </div>
        </div>

        <!-- Saved Chats Section -->
        <div class="animate-slide-up stagger-4">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <div class="p-1.5 bg-primary-50 rounded-lg text-primary-500">
                <!-- Saved chats icon SVG -->
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h2 class="text-lg font-bold text-text-primary tracking-tight">{{ $t('profile.savedChats') }}</h2>
            </div>
            
            <NuxtLink to="/chat" class="group flex items-center gap-0.5 text-xs font-bold text-primary-500 hover:text-primary-600 transition-colors">
              <span>{{ $t('common.seeAll') }}</span>
              <svg class="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </NuxtLink>
          </div>

          <!-- Empty list handler -->
          <div v-if="sessions.length === 0" class="border border-dashed border-border-soft rounded-2xl bg-white/40 p-1">
            <EmptyState
              icon="💬"
              :title="$t('chat.sessions.title')"
              :description="$t('chat.sessions.empty')"
              :action-label="$t('chat.newChat')"
              action-to="/chat"
            />
          </div>

          <!-- Chats List -->
          <div v-else class="space-y-3">
            <NuxtLink
              v-for="session in sessions.slice(0, 5)"
              :key="session.id"
              :to="`/chat/${session.id}`"
              class="block group/item"
            >
              <GlassCard variant="solid" padding="sm" :hover="true" class="border border-white/60 group-hover/item:border-primary-200/50 group-hover/item:shadow-glow-primary transition-all duration-300">
                <div class="flex items-center gap-3">
                  <!-- Custom Chat Bubble Icon SVG -->
                  <div class="p-2 bg-primary-50 text-primary-500 rounded-xl group-hover/item:scale-110 transition-transform duration-200">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  
                  <span class="text-sm font-semibold text-text-primary truncate flex-1 group-hover/item:text-primary-600 transition-colors">
                    {{ session.title }}
                  </span>
                  
                  <!-- Sliding trailing chevron -->
                  <div class="text-text-muted group-hover/item:text-primary-500 transform group-hover/item:translate-x-1 transition-all duration-200">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </GlassCard>
            </NuxtLink>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
  import { storeToRefs } from 'pinia'

  definePageMeta({
    layout: 'default',
    middleware: ['auth'],
  })

  useHead({
    title: 'Profil — RuangTeduh',
  })

  const profileStore = useProfileStore()
  const moodStore = useMoodStore()
  const chatStore = useChatStore()
  const authStore = useAuthStore()

  const { profile } = storeToRefs(profileStore)
  const { moodStats, moods } = storeToRefs(moodStore)
  const { sessions } = storeToRefs(chatStore)

  const editUsername = ref('')
  const editEmoji = ref('🌿')
  const saving = ref(false)
  const saveSuccess = ref(false)

  const avatarEmojis = ['🌿', '🌸', '🌙', '☀️', '🦋', '🐱', '🐻', '🌈', '⭐', '🍀', '🌺', '🎭']

  const hasChanges = computed(() => {
    return (
      (editUsername.value.trim() !== '' && editUsername.value !== profile.value?.username) ||
      editEmoji.value !== profile.value?.avatar_emoji
    )
  })

  const handleUpdateProfile = async () => {
    if (!hasChanges.value) return
    saving.value = true
    try {
      await profileStore.updateProfile({
        username: editUsername.value.trim(),
        avatar_emoji: editEmoji.value,
      })
      saveSuccess.value = true
      setTimeout(() => (saveSuccess.value = false), 2000)
    } catch (e) {
      console.error(e)
    } finally {
      saving.value = false
    }
  }

  const handleLogout = () => {
    authStore.logout()
  }

  onMounted(async () => {
    await Promise.all([
      profileStore.fetchProfile(),
      moodStore.fetchMoods(),
      chatStore.fetchSessions(),
    ])
    if (profile.value) {
      editUsername.value = profile.value.username || ''
      editEmoji.value = profile.value.avatar_emoji || '🌿'
    }
  })
</script>

<style scoped>
.animate-scale-in {
  animation: scale-in 0.3s var(--ease-bounce) forwards;
}
</style>
