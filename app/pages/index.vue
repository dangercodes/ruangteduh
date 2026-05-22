<template>
  <div class="gradient-surface relative min-h-screen flex flex-col justify-between overflow-x-hidden">
    <!-- Decorative Floating Gradient Background Orbs -->
    <FloatingGradient />

    <!-- Landing Header / Navbar -->
    <header class="w-full py-4 px-6 md:px-12 flex justify-between items-center glass-strong z-20 sticky top-0 border-b border-white/30 shadow-soft">
      <div class="flex items-center gap-3">
        <img src="../assets/images/logo.png" alt="Logo" class="w-10 h-10 rounded-xl object-cover shadow-soft">
        <span class="text-lg font-bold text-gradient">RuangTeduh</span>
      </div>
      <div class="flex items-center gap-2">
        <template v-if="authStore.user || authStore.isGuest">
          <SoftButton variant="primary" size="sm" @click="navigateTo('/dashboard')">
            {{ $t('nav.home') }}
          </SoftButton>
        </template>
        <template v-else>
          <SoftButton variant="ghost" size="sm" @click="navigateTo('/auth/login')">
            {{ $t('auth.login.submit') }}
          </SoftButton>
          <SoftButton variant="primary" size="sm" @click="navigateTo('/auth/register')">
            {{ $t('auth.register.submit') }}
          </SoftButton>
        </template>
      </div>
    </header>

    <!-- Main Content Container -->
    <main class="flex-grow pt-10 pb-16 px-4 md:px-8 max-w-5xl mx-auto w-full space-y-24">
      
      <!-- Hero Section -->
      <section class="text-center space-y-8 animate-fade-in pt-8">
        
        <!-- Breathing Badge -->
        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-100/50 border border-primary-200/50 text-xs font-semibold text-primary-700 animate-pulse-gentle mx-auto shadow-sm">
          <span>🌱</span>
          <span>Ruang Aman & Menenangkan</span>
        </div>

        <!-- Headline Stack -->
        <div class="space-y-4 max-w-2xl mx-auto">
          <h1 class="text-4xl sm:text-5xl md:text-6xl font-bold text-gradient leading-tight tracking-tight drop-shadow-sm">
            {{ $t('landing.hero.title') }}
          </h1>
          <p class="text-base sm:text-lg text-text-secondary leading-relaxed max-w-xl mx-auto">
            {{ $t('landing.hero.subtitle') }}
          </p>
        </div>

        <!-- CTA Buttons -->
        <div class="flex flex-col sm:flex-row gap-3.5 justify-center pt-2 max-w-sm mx-auto">
          <SoftButton variant="primary" size="lg" class="shadow-glow-primary active:scale-[0.98] w-full sm:w-auto" @click="navigateTo(ctaTarget)">
            {{ (authStore.user || authStore.isGuest) ? $t('nav.home') : $t('landing.hero.cta') }}
          </SoftButton>
          <SoftButton variant="outline" size="lg" class="w-full sm:w-auto hover:bg-white/40" @click="scrollToFeatures">
            {{ $t('landing.hero.ctaSecondary') }}
          </SoftButton>
        </div>

        <!-- Interactive Mock Chat Preview -->
        <div class="max-w-md mx-auto mt-14 animate-slide-up stagger-3">
          <div class="glass-strong rounded-3xl p-6 shadow-large border border-white/50 text-left relative overflow-hidden transition-all duration-300 hover:shadow-glow-primary hover:border-white/70">
            <!-- Glass Header -->
            <div class="flex items-center gap-3 pb-4 border-b border-border-soft/40 mb-4">
              <div class="w-10 h-10 rounded-2xl bg-primary-100 flex items-center justify-center text-xl shadow-inner">
                🤖
              </div>
              <div>
                <p class="text-sm font-semibold text-text-primary">Teman AI Teduh</p>
                <p class="text-xs text-success flex items-center gap-1">
                  <span class="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                  Siap mendengarkan
                </p>
              </div>
            </div>

            <!-- Message Bubbles -->
            <div class="space-y-4 min-h-[140px] flex flex-col justify-end">
              <!-- AI Bubble -->
              <div class="flex items-start gap-2.5">
                <div class="bg-primary-50/80 text-text-primary text-sm p-3.5 rounded-2xl rounded-tl-none max-w-[85%] leading-relaxed shadow-soft border border-white/20">
                  Halo! Aku ada di sini untuk mendengarkanmu tanpa dihakimi. Bagaimana perasaanmu hari ini? 😊
                </div>
              </div>

              <!-- User Mood Selection Bubble (if chosen) -->
              <div v-if="userSelectedMood" class="flex items-start gap-2.5 justify-end animate-scale-in">
                <div class="bg-primary-500 text-white text-sm p-3.5 rounded-2xl rounded-tr-none max-w-[85%] leading-relaxed shadow-soft">
                  Aku merasa {{ userSelectedMood }}...
                </div>
              </div>

              <!-- AI Response Bubble (with typing simulator) -->
              <div v-if="isTyping" class="flex items-start gap-2.5">
                <div class="bg-primary-50/80 text-text-primary text-sm p-3.5 rounded-2xl rounded-tl-none max-w-[85%] flex items-center gap-1 shadow-soft border border-white/20">
                  <span class="w-1.5 h-1.5 bg-text-secondary rounded-full animate-bounce"></span>
                  <span class="w-1.5 h-1.5 bg-text-secondary rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span class="w-1.5 h-1.5 bg-text-secondary rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>

              <div v-if="activeMoodResponse && !isTyping" class="flex items-start gap-2.5 animate-slide-up">
                <div class="bg-primary-50/80 text-text-primary text-sm p-3.5 rounded-2xl rounded-tl-none max-w-[85%] leading-relaxed shadow-soft border border-white/20">
                  {{ activeMoodResponse }}
                </div>
              </div>
            </div>

            <!-- Interactive Options (Buttons) -->
            <div class="mt-6 pt-4 border-t border-border-soft/40">
              <p class="text-xs text-text-secondary mb-3 font-semibold">Klik perasaanmu untuk mencoba percakapan:</p>
              <div class="flex flex-wrap gap-2">
                <button 
                  @click="selectMood('Lelah')"
                  class="px-4 py-2 rounded-full bg-white/80 hover:bg-primary-500 hover:text-white border border-border-soft text-xs font-semibold text-text-secondary transition-all active:scale-95 shadow-soft cursor-pointer"
                  :class="{'!bg-primary-500 !text-white !border-primary-500 shadow-glow-primary': userSelectedMood === 'Lelah'}"
                >
                  ☕ Lelah
                </button>
                <button 
                  @click="selectMood('Cemas')"
                  class="px-4 py-2 rounded-full bg-white/80 hover:bg-primary-500 hover:text-white border border-border-soft text-xs font-semibold text-text-secondary transition-all active:scale-95 shadow-soft cursor-pointer"
                  :class="{'!bg-primary-500 !text-white !border-primary-500 shadow-glow-primary': userSelectedMood === 'Cemas'}"
                >
                  🌊 Cemas
                </button>
                <button 
                  @click="selectMood('Sedih')"
                  class="px-4 py-2 rounded-full bg-white/80 hover:bg-primary-500 hover:text-white border border-border-soft text-xs font-semibold text-text-secondary transition-all active:scale-95 shadow-soft cursor-pointer"
                  :class="{'!bg-primary-500 !text-white !border-primary-500 shadow-glow-primary': userSelectedMood === 'Sedih'}"
                >
                  🌧️ Sedih
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section id="features" class="space-y-12 scroll-mt-24">
        <div class="text-center space-y-3">
          <h2 class="text-3xl font-bold text-text-primary tracking-tight">
            {{ $t('landing.features.title') }}
          </h2>
          <p class="text-text-secondary max-w-md mx-auto text-sm">
            RuangTeduh dirancang khusus untuk mendampingi kesehatan mental Anda setiap hari dengan cara yang aman dan nyaman.
          </p>
        </div>

        <div class="grid sm:grid-cols-2 gap-6">
          <GlassCard
            v-for="(feature, index) in features"
            :key="feature.key"
            variant="frosted"
            :hover="true"
            class="animate-slide-up group border border-white/40 shadow-medium hover:shadow-glow-primary transition-all duration-300"
            :class="`stagger-${index + 1}`"
          >
            <div class="flex items-start gap-4">
              <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-300"
                :style="{ backgroundColor: feature.bgColor }">
                {{ feature.icon }}
              </div>
              <div class="space-y-1">
                <h3 class="font-bold text-text-primary text-base group-hover:text-primary-600 transition-colors">
                  {{ $t(feature.titleKey) }}
                </h3>
                <p class="text-sm text-text-secondary leading-relaxed">
                  {{ $t(feature.descKey) }}
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      <!-- Trust & Privacy Shield Section -->
      <section class="animate-slide-up stagger-4">
        <div class="glass-strong rounded-3xl p-8 md:p-12 border border-white/50 shadow-large text-center relative overflow-hidden">
          <!-- Decorative gradient splash -->
          <div class="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-calm-300/10 blur-[60px]" />
          <div class="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-lavender-300/10 blur-[60px]" />

          <div class="max-w-2xl mx-auto space-y-6 relative z-10">
            <div class="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-3xl mx-auto shadow-inner animate-pulse-gentle">
              🛡️
            </div>
            <h2 class="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
              {{ $t('landing.trust.title') }}
            </h2>
            <p class="text-text-secondary leading-relaxed text-sm sm:text-base">
              {{ $t('landing.trust.description') }}
            </p>
            <div class="pt-4 flex flex-col sm:flex-row gap-3.5 justify-center max-w-xs mx-auto">
              <SoftButton variant="primary" size="lg" class="shadow-glow-primary w-full" @click="navigateTo(ctaTarget)">
                {{ (authStore.user || authStore.isGuest) ? $t('nav.home') : $t('landing.hero.cta') }}
              </SoftButton>
            </div>
          </div>
        </div>
      </section>

    </main>

    <!-- Footer -->
    <footer class="glass-strong py-8 px-6 text-center border-t border-white/20">
      <div class="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-text-muted">
        <p>© {{ new Date().getFullYear() }} RuangTeduh. {{ $t('app.tagline') }}</p>
        <div class="flex gap-4">
          <a href="#" class="hover:text-primary-500 transition-colors">Kebijakan Privasi</a>
          <a href="#" class="hover:text-primary-500 transition-colors">Ketentuan Layanan</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

definePageMeta({
  layout: false,
})

const authStore = useAuthStore()
const ctaTarget = computed(() => {
  return (authStore.user || authStore.isGuest) ? '/dashboard' : '/auth/register'
})

useHead({
  title: 'RuangTeduh — Tempat Beristirahat Saat Hidup Terasa Berat',
  meta: [
    { name: 'description', content: 'Platform dukungan emosional yang aman dan menenangkan untuk berbagi perasaan, berbicara dengan teman AI, dan terhubung dengan komunitas yang suportif.' },
  ],
})

// Interactive Chatbot States & Logic
const activeMoodResponse = ref<string | null>(null)
const userSelectedMood = ref<string | null>(null)
const isTyping = ref(false)

const selectMood = (mood: string) => {
  userSelectedMood.value = mood
  isTyping.value = true
  activeMoodResponse.value = null
  
  setTimeout(() => {
    isTyping.value = false
    if (mood === 'Lelah') {
      activeMoodResponse.value = 'Ambil nafas dalam-dalam... Istirahatlah sejenak. Kamu telah berusaha keras hari ini, dan itu lebih dari cukup. ☕🌿'
    } else if (mood === 'Cemas') {
      activeMoodResponse.value = 'Rasakan kakimu menyentuh lantai. Kamu aman di sini. Tarik nafas perlahan... Semuanya akan baik-baik saja secara perlahan. 🌊🕊️'
    } else if (mood === 'Sedih') {
      activeMoodResponse.value = 'Tidak apa-apa untuk merasa sedih atau tidak baik-baik saja. Menangislah jika itu meringankan bebanmu. Aku di sini bersamamu. 🌧️💜'
    }
  }, 1000)
}

const features = [
  {
    key: 'aiChat',
    icon: '🤖',
    titleKey: 'landing.features.aiChat.title',
    descKey: 'landing.features.aiChat.description',
    bgColor: 'rgba(91, 108, 250, 0.1)',
  },
  {
    key: 'moodTracker',
    icon: '📊',
    titleKey: 'landing.features.moodTracker.title',
    descKey: 'landing.features.moodTracker.description',
    bgColor: 'rgba(16, 185, 166, 0.1)',
  },
  {
    key: 'community',
    icon: '🤝',
    titleKey: 'landing.features.community.title',
    descKey: 'landing.features.community.description',
    bgColor: 'rgba(168, 85, 247, 0.1)',
  },
  {
    key: 'safe',
    icon: '🔒',
    titleKey: 'landing.features.safe.title',
    descKey: 'landing.features.safe.description',
    bgColor: 'rgba(245, 158, 11, 0.1)',
  },
]

const scrollToFeatures = () => {
  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
}
</script>
