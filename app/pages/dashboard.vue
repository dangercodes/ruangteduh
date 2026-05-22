<template>
  <div class="space-y-8">
    <!-- Gorgeous Glowing Greeting Header Banner -->
    <div class="animate-slide-up relative overflow-hidden rounded-3xl border border-white/60 shadow-medium bg-gradient-to-r from-primary-50/50 via-lavender-50/40 to-calm-50/30 p-6 sm:p-8">
      <!-- Background Ambient Glow Orbs -->
      <div class="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-primary-200/20 blur-3xl" />
      <div class="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-calm-200/20 blur-3xl" />
      
      <div class="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div class="flex items-center gap-4 sm:gap-5">
          <!-- Animated Avatar Orb -->
          <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/90 shadow-soft border border-white/80 flex items-center justify-center text-3xl sm:text-4xl group-hover:scale-110 transition-transform duration-300 animate-breathing">
            {{ profile?.avatar_emoji || '🌿' }}
          </div>
          <div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
              {{ greetingText }}, <span class="text-gradient">{{ profile?.username || 'Teman Teduh' }}</span> {{ timeGreeting.emoji }}
            </h1>
            <p class="text-text-secondary mt-1 text-sm sm:text-base font-medium flex items-center gap-1.5">
              <span>🌱</span> {{ subtitleText }}
            </p>
          </div>
        </div>

        <!-- Breathing Dynamic Date & Streak Pill -->
        <div class="flex flex-wrap items-center gap-3 self-start md:self-auto">
          <!-- Daily Streak -->
          <div class="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl glass border border-white/50 text-xs font-bold text-primary-600 shadow-soft">
            <span>🔥</span>
            <span>{{ locale === 'id' ? (stats.moodEntries > 0 ? 'Aktif Minggu Ini' : 'Mulai Jurnalmu') : (stats.moodEntries > 0 ? 'Active This Week' : 'Start Journaling') }}</span>
          </div>
          <!-- Date -->
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-2xl glass-strong border border-white/80 text-xs font-semibold text-text-secondary shadow-soft">
            <span class="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
            <span>{{ currentDateFormatted }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Desktop Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      
      <!-- Left Column: Main Interactive Panels (Spans 2 columns on desktop) -->
      <div class="lg:col-span-2 space-y-8">
        
        <!-- Quick Mood Log Card -->
        <GlassCard variant="frosted" padding="lg" class="animate-slide-up stagger-1 border border-white/60 shadow-medium hover:border-white/80 transition-all duration-300 relative overflow-hidden">
          <div class="absolute top-0 right-0 w-32 h-32 bg-primary-100/10 rounded-full blur-2xl pointer-events-none" />
          <div class="mb-5">
            <h3 class="text-base font-bold text-text-primary flex items-center gap-2">
              <span>📝</span> {{ locale === 'id' ? 'Bagaimana suasana hatimu saat ini?' : 'How is your mood right now?' }}
            </h3>
            <p class="text-xs text-text-secondary mt-1">{{ locale === 'id' ? 'Ekspresikan perasaanmu dalam satu ketukan cepat di bawah ini.' : 'Express your feelings in a single quick tap below.' }}</p>
          </div>
          
          <EmotionSelector v-model="quickMood" />
          
          <div v-if="quickMood" class="mt-5 flex flex-col sm:flex-row gap-3 animate-slide-up">
            <input
              v-model="quickNote"
              type="text"
              :placeholder="$t('mood.notePlaceholder')"
              class="flex-1 px-4 py-2.5 bg-surface-dim rounded-xl border-0 text-sm text-text-primary placeholder-text-muted focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all shadow-inner"
            />
            <SoftButton variant="primary" size="md" :loading="savingMood" class="shadow-glow-primary cursor-pointer w-full sm:w-auto" @click="saveQuickMood">
              {{ $t('mood.submit') }}
            </SoftButton>
          </div>
          <p v-if="moodSaved" class="text-sm text-success text-center mt-3 animate-scale-in font-semibold">
            {{ $t('mood.saved') }} 🌱
          </p>
        </GlassCard>

        <!-- Quick AI Companion Prompts Shortcuts -->
        <GlassCard variant="frosted" padding="lg" class="animate-slide-up stagger-2 border border-white/60 shadow-medium hover:border-white/80 transition-all duration-300 relative overflow-hidden bg-gradient-to-br from-white/80 to-primary-50/20">
          <div class="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-primary-200/20 blur-xl pointer-events-none" />
          <div class="relative z-10 space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-primary-100 flex items-center justify-center text-xl shadow-soft text-primary-600 animate-pulse-gentle">
                💬
              </div>
              <div>
                <h3 class="text-sm sm:text-base font-bold text-text-primary">
                  {{ locale === 'id' ? 'Butuh Teman Bicara?' : 'Need Someone to Talk To?' }}
                </h3>
                <p class="text-xs text-text-secondary mt-0.5">
                  {{ locale === 'id' ? 'Teduh AI siap mendengarmu kapan saja tanpa penghakiman. Klik salah satu topik di bawah ini:' : 'Teduh AI is ready to listen anytime without judgment. Tap one of the topics below:' }}
                </p>
              </div>
            </div>
            
            <!-- Quick Chips Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <button 
                v-for="chip in aiChips" 
                :key="chip.prompt"
                @click="startAIChat(chip.prompt)"
                class="flex items-center gap-2.5 text-left text-xs px-4 py-3 rounded-2xl bg-white/70 hover:bg-primary-500 hover:text-white border border-primary-100 text-primary-700 hover:border-primary-500 font-semibold shadow-soft hover:shadow-glow-primary transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer group"
              >
                <span class="text-base group-hover:scale-110 transition-transform">{{ chip.emoji }}</span>
                <span class="flex-1 truncate">{{ chip.label }}</span>
                <span class="text-[10px] opacity-60">→</span>
              </button>
            </div>
          </div>
        </GlassCard>

        <!-- Recent Moods Feed -->
        <div class="animate-slide-up stagger-3 space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-bold text-text-primary flex items-center gap-2">
              <span>📊</span> {{ $t('dashboard.recentMood.title') }}
            </h2>
            <NuxtLink to="/mood" class="text-xs font-bold text-primary-500 hover:text-primary-600 transition-colors flex items-center gap-1">
              {{ $t('common.seeAll') }} <span>→</span>
            </NuxtLink>
          </div>

          <div v-if="loadingMoods">
            <LoadingSkeleton variant="mood" />
          </div>
          <div v-else-if="recentMoods.length === 0">
            <EmptyState
              icon="🌱"
              :title="$t('dashboard.recentMood.empty')"
              :description="$t('empty.general.description')"
              :action-label="$t('dashboard.quickActions.mood')"
              action-to="/mood"
            />
          </div>
          <div v-else class="grid sm:grid-cols-2 gap-4">
            <MoodCard
              v-for="entry in recentMoods"
              :key="entry.id"
              :entry="entry"
              class="border border-white/30 hover:border-white/60 transition-all duration-300 hover:shadow-medium"
            />
          </div>
        </div>

        <!-- Calming & Relaxation Space Banner -->
        <div class="animate-slide-up stagger-4 relative overflow-hidden rounded-3xl border border-white/60 shadow-medium bg-gradient-to-br from-white/80 to-emerald-50/20 p-6 sm:p-8 hover:border-emerald-300/80 transition-all duration-300 group">
          <!-- Ambient glowing background orbs -->
          <div class="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-emerald-100/30 blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-500" />
          <div class="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-teal-100/20 blur-3xl pointer-events-none" />
          
          <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div class="space-y-2">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest">
                🧘‍♂️ {{ locale === 'id' ? 'Ruang Teduh & Relaksasi' : 'Calming & Relaxation Space' }}
              </span>
              <h3 class="text-lg sm:text-xl font-extrabold text-text-primary tracking-tight">
                {{ $t('dashboard.calming.banner.title') }}
              </h3>
              <p class="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-xl font-medium">
                {{ $t('dashboard.calming.banner.description') }}
              </p>
            </div>
            
            <button
              @click="isCalmingModalOpen = true"
              class="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-extrabold rounded-2xl shadow-glow-primary hover:shadow-glow-success transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
            >
              <span>{{ $t('dashboard.calming.banner.button') }}</span>
            </button>
          </div>
        </div>

      </div>

      <!-- Right Column: Sidebar Panels (Spans 1 column on desktop) -->
      <div class="space-y-8">
        
        <!-- Interactive Daily Self-Care Checklist -->
        <div class="animate-slide-up stagger-4 space-y-4">
          <h2 class="text-lg font-bold text-text-primary flex items-center gap-2">
            <span>✨</span> {{ locale === 'id' ? 'Rutinitas Self-Care' : 'Self-Care Routine' }}
          </h2>
          
          <div class="glass-strong rounded-3xl p-5 border border-white/60 shadow-medium space-y-4 relative overflow-hidden">
            <!-- Checklist Header with dynamic progress -->
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-text-secondary uppercase tracking-wider">
                {{ locale === 'id' ? 'Pelacak Harian' : 'Daily Tracker' }}
              </span>
              <span class="text-xs font-extrabold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full border border-primary-100">
                {{ habitProgress }}%
              </span>
            </div>

            <!-- Custom Progress Bar -->
            <div class="w-full h-2 bg-surface-dim rounded-full overflow-hidden shadow-inner">
              <div 
                class="h-full bg-gradient-to-r from-primary-400 to-calm-400 rounded-full transition-all duration-500 ease-calm"
                :style="{ width: `${habitProgress}%` }"
              />
            </div>

            <!-- Checklist Items -->
            <div class="space-y-2.5 pt-1">
              <button
                v-for="habit in translatedHabits"
                :key="habit.id"
                @click="toggleHabit(habit.id)"
                class="w-full flex items-center justify-between text-left p-3 rounded-2xl hover:bg-white/60 border border-transparent hover:border-white/40 transition-all duration-200 cursor-pointer group"
                :class="habit.checked ? 'bg-white/40' : 'bg-surface-dim/40'"
              >
                <div class="flex items-center gap-3">
                  <!-- Custom Checkbox Bubble -->
                  <div 
                    class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300"
                    :class="habit.checked ? 'bg-primary-500 border-primary-500 shadow-glow-primary scale-110' : 'border-text-muted/40 bg-white'"
                  >
                    <svg v-if="habit.checked" class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span 
                    class="text-xs font-semibold transition-all duration-300"
                    :class="habit.checked ? 'line-through text-text-muted font-medium' : 'text-text-primary'"
                  >
                    {{ habit.label }}
                  </span>
                </div>
                <span class="text-sm group-hover:scale-110 transition-transform">{{ habit.emoji }}</span>
              </button>
            </div>

            <!-- Complete Celebration message -->
            <div v-if="habitsCompleted" class="text-center p-3 rounded-2xl bg-calm-50 border border-calm-100 text-xs font-semibold text-calm-600 animate-scale-in">
              🎉 {{ locale === 'id' ? 'Hebat! Rutinitas hari ini selesai.' : 'Awesome! Today\'s routine is completed.' }}
            </div>
          </div>
        </div>

        <!-- Premium Unified Statistics Panel -->
        <div class="animate-slide-up stagger-5 space-y-4">
          <h2 class="text-lg font-bold text-text-primary flex items-center gap-2">
            <span>📈</span> {{ locale === 'id' ? 'Ringkasan Aktivitasmu' : 'Your Activity Summary' }}
          </h2>
          
          <div class="glass-strong rounded-3xl p-5 border border-white/60 shadow-medium space-y-4">
            <div class="grid grid-cols-3 gap-3">
              <!-- Mood Stat -->
              <div class="bg-primary-50/50 rounded-2xl p-3 text-center border border-white/20 hover:bg-primary-50 hover:border-primary-100 transition-all duration-300 shadow-soft hover:shadow-medium">
                <p class="text-2xl font-extrabold text-primary-600 drop-shadow-sm">{{ stats.moodEntries }}</p>
                <p class="text-[9px] font-bold text-text-secondary mt-1 uppercase tracking-wider">Mood</p>
              </div>
              <!-- Chat Stat -->
              <div class="bg-lavender-50/50 rounded-2xl p-3 text-center border border-white/20 hover:bg-lavender-50 hover:border-lavender-100 transition-all duration-300 shadow-soft hover:shadow-medium">
                <p class="text-2xl font-extrabold text-lavender-600 drop-shadow-sm">{{ stats.chatSessions }}</p>
                <p class="text-[9px] font-bold text-text-secondary mt-1 uppercase tracking-wider">Chat AI</p>
              </div>
              <!-- Community Stat -->
              <div class="bg-calm-50/50 rounded-2xl p-3 text-center border border-white/20 hover:bg-calm-50 hover:border-calm-100 transition-all duration-300 shadow-soft hover:shadow-medium">
                <p class="text-2xl font-extrabold text-calm-600 drop-shadow-sm">{{ stats.communityPosts }}</p>
                <p class="text-[9px] font-bold text-text-secondary mt-1 uppercase tracking-wider">{{ locale === 'id' ? 'Kiriman' : 'Posts' }}</p>
              </div>
            </div>
            
            <!-- Contextual tagline -->
            <p class="text-xs text-text-secondary leading-relaxed text-center italic px-2">
              "{{ locale === 'id' ? 'Kesehatan mental adalah perjalanan panjang, mari melangkah selangkah demi selangkah.' : 'Mental health is a journey, let us take one small step at a time.' }}"
            </p>
          </div>
        </div>

        <!-- Dashboard Quick Actions with SVG Icons matching CalmNavbar -->
        <div class="animate-slide-up stagger-6 space-y-4">
          <h2 class="text-lg font-bold text-text-primary flex items-center gap-2">
            <span>⚡</span> Akses Cepat
          </h2>
          
          <div class="grid grid-cols-2 gap-3.5">
            <NuxtLink
              v-for="action in quickActions"
              :key="action.to"
              :to="action.to"
              class="group"
            >
              <GlassCard variant="frosted" padding="md" :hover="true" class="border border-white/40 shadow-soft group-hover:shadow-glow-primary group-hover:border-white/70 transition-all duration-300">
                <div class="text-center space-y-2">
                  <!-- SVG Icon Container -->
                  <div class="w-12 h-12 rounded-2xl bg-white/90 flex items-center justify-center mx-auto shadow-soft group-hover:scale-110 group-hover:bg-primary-50 transition-all duration-300">
                    <!-- Chat AI SVG -->
                    <svg v-if="action.icon === 'chat'" class="w-6 h-6 text-primary-500 group-hover:text-primary-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 8.511c.084.29.125.597.125.911 0 3.87-4.033 7-9 7H9.897L5.84 19.825c-.476.465-1.29.138-1.29-.523v-2.438C3.513 15.656 3 14.39 3 13c0-3.87 4.033-7 9-7 1.406 0 2.721.258 3.856.711m4.394 1.8c.084.29.125.597.125.911 0 1.39-.513 2.656-1.55 3.862" />
                    </svg>
                    <!-- Mood Log SVG -->
                    <svg v-else-if="action.icon === 'mood'" class="w-6 h-6 text-lavender-500 group-hover:text-lavender-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
                    </svg>
                    <!-- Community SVG -->
                    <svg v-else-if="action.icon === 'community'" class="w-6 h-6 text-calm-500 group-hover:text-calm-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                    </svg>
                    <!-- Journal/Profile SVG -->
                    <svg v-else-if="action.icon === 'journal'" class="w-6 h-6 text-secondary-500 group-hover:text-secondary-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                    </svg>
                  </div>
                  <span class="text-xs font-semibold text-text-secondary group-hover:text-primary-600 transition-colors block">
                    {{ $t(action.labelKey) }}
                  </span>
                </div>
              </GlassCard>
            </NuxtLink>
          </div>
        </div>

        <!-- Breathing Inspiring thought (Tip of the Day) with Shuffle -->
        <div class="animate-slide-up stagger-7">
          <div class="glass-strong rounded-3xl p-6 border border-white/60 shadow-medium relative overflow-hidden bg-gradient-to-br from-white/70 to-calm-50/50">
            <!-- Decorative gradient orb -->
            <div class="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-calm-200/20 blur-xl" />
            
            <div class="relative z-10 space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-xl">✨</span>
                <button 
                  @click="shuffleQuote" 
                  class="text-[10px] font-bold text-primary-500 bg-white border border-primary-100 hover:bg-primary-500 hover:text-white px-2 py-1 rounded-full cursor-pointer transition-all duration-300"
                  :title="locale === 'id' ? 'Muat kutipan lain' : 'Load another quote'"
                >
                  🔄 {{ locale === 'id' ? 'Acak' : 'Shuffle' }}
                </button>
              </div>
              
              <!-- Quote Container with simple key-based trigger for transition -->
              <div :key="quoteKey" class="transition-all duration-300 transform scale-100 opacity-100 animate-scale-in">
                <p class="text-sm font-semibold text-text-primary leading-relaxed italic">
                  {{ activeQuote }}
                </p>
              </div>
              <p class="text-[9px] font-bold text-calm-600 uppercase tracking-widest">— {{ locale === 'id' ? 'PERENUNGAN HARI INI' : 'TODAY\'S REFLECTION' }}</p>
            </div>
          </div>
        </div>

      </div>

    </div>

    <!-- Interactive Mindfulness & Calming Modal -->
    <CalmingModal
      :is-open="isCalmingModalOpen"
      @close="isCalmingModalOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { MoodType, WeeklyStats } from '~/types'
import { storeToRefs } from 'pinia'

definePageMeta({
  layout: 'default',
  middleware: ['auth'],
})

useHead({
  title: 'Dashboard — RuangTeduh',
})

const { locale } = useI18n()
const profileStore = useProfileStore()
const moodStore = useMoodStore()
const authStore = useAuthStore()
const chatStore = useChatStore()

const { profile } = storeToRefs(profileStore)
const { moods, loading: loadingMoods } = storeToRefs(moodStore)

const quickMood = ref<MoodType | null>(null)
const quickNote = ref('')
const savingMood = ref(false)
const moodSaved = ref(false)
const isCalmingModalOpen = ref(false)

const stats = ref<WeeklyStats>({ moodEntries: 0, chatSessions: 0, communityPosts: 0 })

const recentMoods = computed(() => moods.value.slice(0, 6))

// Custom SVGs matching CalmNavbar
const quickActions = [
  { to: '/chat', icon: 'chat', labelKey: 'dashboard.quickActions.chat' },
  { to: '/mood', icon: 'mood', labelKey: 'dashboard.quickActions.mood' },
  { to: '/community', icon: 'community', labelKey: 'dashboard.quickActions.community' },
  { to: '/journal', icon: 'journal', labelKey: 'dashboard.quickActions.journal' },
]

// Self-care habits tracker
const selfCareHabits = ref([
  { id: 'water', emoji: '💧', checked: false },
  { id: 'meditation', emoji: '🧘', checked: false },
  { id: 'mood', emoji: '📝', checked: false },
  { id: 'ai_chat', emoji: '💬', checked: false },
])

const translatedHabits = computed(() => {
  const isId = locale.value === 'id'
  return selfCareHabits.value.map(h => {
    let label = ''
    if (h.id === 'water') label = isId ? 'Minum air cukup (8 gelas)' : 'Drink 8 glasses of water'
    else if (h.id === 'meditation') label = isId ? 'Meditasi tenang (5-10 menit)' : 'Practice mindfulness meditation'
    else if (h.id === 'mood') label = isId ? 'Mencatat suasana hatimu' : 'Log your current mood'
    else if (h.id === 'ai_chat') label = isId ? 'Obrolan damai dengan Teduh AI' : 'Talk with Teduh AI'
    return { ...h, label }
  })
})

const toggleHabit = (id: string) => {
  const habit = selfCareHabits.value.find(h => h.id === id)
  if (habit) {
    habit.checked = !habit.checked
    localStorage.setItem('self_care_habits_v1', JSON.stringify(selfCareHabits.value))
  }
}

const habitProgress = computed(() => {
  const checkedCount = selfCareHabits.value.filter(h => h.checked).length
  return Math.round((checkedCount / selfCareHabits.value.length) * 100)
})

const habitsCompleted = computed(() => habitProgress.value === 100)

// Quick AI chat chips
const aiChips = computed(() => {
  const isId = locale.value === 'id'
  return [
    {
      emoji: '🧘',
      label: isId ? 'Latihan Napas' : 'Breathing Exercise',
      prompt: isId 
        ? 'Bimbing saya melakukan latihan pernapasan dalam selama 3 menit untuk menenangkan pikiran.' 
        : 'Guide me through a simple 3-minute deep breathing exercise to calm my mind.'
    },
    {
      emoji: '🎈',
      label: isId ? 'Meredakan Cemas' : 'Relieve Anxiety',
      prompt: isId 
        ? 'Saya merasa cemas hari ini, bisa bantu saya meredakannya dengan latihan relaksasi?' 
        : 'I feel anxious today, can you help me relieve it with a short relaxation exercise?'
    },
    {
      emoji: '🌿',
      label: isId ? 'Butuh Motivasi' : 'Get Motivation',
      prompt: isId 
        ? 'Saya merasa lelah dan kurang bersemangat hari ini, berikan saya kata-kata penyemangat.' 
        : 'I feel down and lack energy today, please give me some encouraging words and motivation.'
    },
    {
      emoji: '☕',
      label: isId ? 'Hanya Curhat' : 'Want to Vent',
      prompt: isId 
        ? 'Saya sedang mengalami hari yang panjang dan hanya ingin menceritakan perasaan saya.' 
        : 'I have had a long day and just want to vent and talk about my feelings.'
    }
  ]
})

const startAIChat = async (prompt: string) => {
  try {
    const session = await chatStore.createSession()
    if (session) {
      navigateTo({
        path: `/chat/${session.id}`,
        query: { prompt }
      })
    }
  } catch (e) {
    console.error('Failed to start chat session:', e)
  }
}

// Calming Quotes / Mental Health Tips of the Day
const quotes = [
  "“Setiap langkah kecil yang kamu ambil hari ini adalah kemajuan yang berarti. Bernapaslah, kamu sedang berproses.”",
  "“Tidak apa-apa untuk beristirahat sejenak. Menyembuhkan diri bukanlah sebuah perlombaan cepat.”",
  "“Perasaanmu valid. Biarkan dirimu merasakan, lalu lepaskan secara perlahan saat kamu sudah siap.”",
  "“Kamu lebih kuat dari yang kamu sadari, dan kamu layak mendapatkan kedamaian pikiran hari ini.”",
  "“Apapun yang terjadi hari ini, ingatlah bahwa besok adalah kesempatan baru untuk memulai kembali dengan tenang.”",
  "“Jadilah lembut pada dirimu sendiri hari ini. Kamu sedang melakukan yang terbaik yang kamu bisa.”",
  "“Kedamaian tidak datang dari menghilangkan kebisingan, tetapi dari menenangkan pikiran di dalamnya.”"
]

const quotesEn = [
  "“Every small step you take today is meaningful progress. Breathe, you are in the process of growing.”",
  "“It is okay to rest for a moment. Healing is not a fast race.”",
  "“Your feelings are valid. Let yourself feel them, then let them go slowly when you are ready.”",
  "“You are stronger than you realize, and you deserve peace of mind today.”",
  "“Whatever happened today, remember that tomorrow is a new opportunity to start over calmly.”",
  "“Be gentle with yourself today. You are doing the absolute best you can.”",
  "“Peace does not come from removing the noise, but from calming your mind within it.”"
]

const quoteIndex = ref(new Date().getDate() % quotes.length)
const quoteKey = ref(0)

const activeQuote = computed(() => {
  const currentList = locale.value === 'id' ? quotes : quotesEn
  return currentList[quoteIndex.value]
})

const shuffleQuote = () => {
  let nextIndex = quoteIndex.value
  while (nextIndex === quoteIndex.value) {
    nextIndex = Math.floor(Math.random() * quotes.length)
  }
  quoteIndex.value = nextIndex
  quoteKey.value++
}

// Current Dynamic Time-aware Greetings
const timeGreeting = computed(() => {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 11) {
    return { textId: 'Selamat Pagi', textEn: 'Good Morning', emoji: '🌅' }
  } else if (hour >= 11 && hour < 15) {
    return { textId: 'Selamat Siang', textEn: 'Good Afternoon', emoji: '☀️' }
  } else if (hour >= 15 && hour < 19) {
    return { textId: 'Selamat Sore', textEn: 'Good Evening', emoji: '🌇' }
  } else {
    return { textId: 'Selamat Malam', textEn: 'Good Night', emoji: '🌙' }
  }
})

const greetingText = computed(() => {
  return locale.value === 'id' ? timeGreeting.value.textId : timeGreeting.value.textEn
})

const subtitleText = computed(() => {
  const isId = locale.value === 'id'
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 11) {
    return isId ? 'Mari awali hari dengan pikiran tenang dan penuh penerimaan.' : 'Let us start the day with a calm and peaceful mind.'
  } else if (hour >= 11 && hour < 15) {
    return isId ? 'Tetap bernapas dengan santai di tengah aktivitas siangmu.' : 'Remember to take slow breaths amidst your afternoon activities.'
  } else if (hour >= 15 && hour < 19) {
    return isId ? 'Luangkan waktu sejenak untuk mengendurkan ketegangan hari ini.' : 'Take a moment to unwind and release today\'s tension.'
  } else {
    return isId ? 'Istirahatkan pikiranmu, lepaskan hari yang telah lalu.' : 'Rest your active mind, and let go of the day that has passed.'
  }
})

// Current Dynamic Date formatted locale-aware
const currentDateFormatted = computed(() => {
  const date = new Date()
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }
  const localeStr = locale.value === 'id' ? 'id-ID' : 'en-US'
  return date.toLocaleDateString(localeStr, options)
})

const saveQuickMood = async () => {
  if (!quickMood.value) return
  savingMood.value = true
  try {
    await moodStore.submitMood(quickMood.value, quickNote.value || null)
    
    // Auto check 'mood' habit log task
    const moodHabit = selfCareHabits.value.find(h => h.id === 'mood')
    if (moodHabit && !moodHabit.checked) {
      moodHabit.checked = true
      localStorage.setItem('self_care_habits_v1', JSON.stringify(selfCareHabits.value))
    }

    moodSaved.value = true
    setTimeout(() => {
      quickMood.value = null
      quickNote.value = ''
      moodSaved.value = false
    }, 2000)
  } catch (e) {
    console.error(e)
  } finally {
    savingMood.value = false
  }
}

onMounted(async () => {
  await Promise.all([
    profileStore.fetchProfile(),
    moodStore.fetchMoods(6),
    profileStore.fetchWeeklyStats().then((s) => (stats.value = s)),
  ])
  
  // Load self care habits check state
  const saved = localStorage.getItem('self_care_habits_v1')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      selfCareHabits.value = selfCareHabits.value.map(h => {
        const match = parsed.find((p: any) => p.id === h.id)
        if (match) h.checked = match.checked
        return h
      })
    } catch (e) {
      console.error(e)
    }
  }

  const userId = await authStore.getUserId()
  console.log("userId", userId)
})
</script>
