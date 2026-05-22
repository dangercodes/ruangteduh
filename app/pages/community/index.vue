<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between animate-slide-up">
      <h1 class="text-2xl font-bold text-text-primary">{{ $t('community.title') }}</h1>
      <SoftButton v-if="!loading && posts.length > 0" variant="primary" @click="handleNewPostClick">
        {{ $t('community.newPost') }}
      </SoftButton>
    </div>

    <!-- Guest Mode Banner -->
    <div v-if="authStore.isGuest" class="px-6 py-5 rounded-2xl bg-gradient-to-r from-primary-50/70 to-lavender-50/70 backdrop-blur-md border border-primary-100/50 shadow-sm space-y-3 animate-slide-up stagger-1">
      <div class="flex items-center gap-3">
        <span class="text-2xl animate-breathing">🍃</span>
        <div>
          <h3 class="text-sm font-bold text-primary-800">Mode Tamu Aktif (Hanya Membaca)</h3>
          <p class="text-xs text-primary-700/80 leading-relaxed mt-0.5">
            Kamu sedang menjelajahi RuangTeduh tanpa akun. Untuk berbagi cerita, berkomentar, atau memberikan reaksi, yuk gabung dengan komunitas!
          </p>
        </div>
      </div>
      <div class="flex gap-2">
        <SoftButton variant="primary" size="sm" class="px-4 text-xs font-semibold py-2" @click="redirectToRegister">
          Daftar Akun
        </SoftButton>
      </div>
    </div>

    <!-- Community guideline -->
    <div v-else class="px-4 py-3 rounded-xl bg-lavender-50 border border-lavender-200 animate-slide-up stagger-1">
      <p class="text-sm text-lavender-700 text-center">
        {{ $t('community.guideline') }}
      </p>
    </div>

    <!-- New Post Form -->
    <Transition
      enter-active-class="transition-all duration-300"
      enter-from-class="opacity-0 -translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-4"
    >
      <GlassCard v-if="showNewPost" variant="frosted" padding="md" class="animate-scale-in">
        <div class="space-y-3">
          <Transition
            enter-active-class="transition-all duration-300"
            enter-from-class="opacity-0 -translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition-all duration-200"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-2"
          >
            <div v-if="errorMessage" class="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-danger/10 text-danger text-sm font-medium border border-danger/20">
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {{ errorMessage }}
              </div>
              <button @click="errorMessage = ''" class="p-1 hover:bg-danger/20 rounded-md transition-colors">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </Transition>
          <textarea
            v-model="newPostContent"
            :placeholder="$t('community.postPlaceholder')"
            class="w-full px-4 py-3 bg-surface-dim rounded-xl border-0 text-sm text-text-primary placeholder-text-muted resize-none focus:ring-2 focus:ring-primary-300 focus:bg-white transition-all"
            rows="4"
            autofocus
          />
          <div class="flex gap-2 justify-end">
            <SoftButton variant="ghost" @click="showNewPost = false; newPostContent = ''">
              {{ $t('common.cancel') }}
            </SoftButton>
            <SoftButton
              variant="primary"
              :loading="posting"
              :disabled="!newPostContent.trim()"
              @click="handleCreatePost"
            >
              {{ $t('community.publish') }}
            </SoftButton>
          </div>
        </div>
      </GlassCard>
    </Transition>

    <!-- Posts Feed -->
    <div v-if="loading" class="space-y-3">
      <LoadingSkeleton variant="card" v-for="i in 3" :key="i" />
    </div>
    <div v-else-if="posts.length === 0" class="animate-fade-in">
      <EmptyState
        icon="💬"
        :title="$t('community.title')"
        :description="$t('community.empty')"
        :action-label="$t('community.newPost')"
        @click="handleNewPostClick"
      />
    </div>
    <div v-else class="space-y-4 animate-fade-in">
      <CommunityPostCard
        v-for="post in posts"
        :key="post.id"
        :post="post"
        @react="(type) => handleReact(post.id, type)"
      />
    </div>

    <!-- Beautiful Conversion Prompt Modal for Guest Mode -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div v-if="showAuthModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" @click.self="showAuthModal = false">
        <GlassCard variant="frosted" padding="lg" class="max-w-md w-full text-center space-y-6 shadow-2xl relative overflow-hidden border border-white/20">
          <div class="absolute -right-10 -top-10 w-32 h-32 bg-primary-200/30 rounded-full blur-2xl"></div>
          <div class="absolute -left-10 -bottom-10 w-32 h-32 bg-lavender-200/30 rounded-full blur-2xl"></div>
          
          <div class="flex justify-center">
            <div class="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center text-3xl animate-breathing border border-primary-100 shadow-sm">
              🍃
            </div>
          </div>
          <div class="space-y-2">
            <h3 class="text-xl font-bold text-text-primary">Gabung dengan Komunitas</h3>
            <p class="text-sm text-text-secondary leading-relaxed">
              Kamu sedang berada di <strong>Mode Tamu</strong>. Untuk berbagi cerita, berkomentar, atau memberikan reaksi dukungan, yuk buat akun atau masuk terlebih dahulu!
            </p>
          </div>
          <div class="flex flex-col gap-2">
            <SoftButton variant="primary" size="lg" class="w-full" @click="redirectToRegister">
              Buat Akun Sekarang
            </SoftButton>
            <SoftButton variant="ghost" size="lg" class="w-full text-text-secondary" @click="showAuthModal = false">
              Nanti Saja
            </SoftButton>
          </div>
        </GlassCard>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
  import type { ReactionType } from '~/types'
  import { storeToRefs } from 'pinia'
  
  definePageMeta({
    layout: 'default',
    middleware: ['auth'],
  })
  
  useHead({
    title: 'Komunitas — RuangTeduh',
  })

  const authStore = useAuthStore()
  const communityStore = useCommunityStore()
  const { posts, loading } = storeToRefs(communityStore)
  const showNewPost = ref(false)
  const newPostContent = ref('')
  const posting = ref(false)
  const showAuthModal = ref(false)
  const errorMessage = ref('')
  let errorTimeout: ReturnType<typeof setTimeout> | null = null

  const showError = (msg: string) => {
    errorMessage.value = msg
    if (errorTimeout) clearTimeout(errorTimeout)
    errorTimeout = setTimeout(() => {
      errorMessage.value = ''
    }, 5000)
  }

  const handleNewPostClick = () => {
    errorMessage.value = ''
    if (authStore.isGuest) {
      showAuthModal.value = true
    } else {
      showNewPost.value = true
    }
  }

  const handleCreatePost = async () => {
    errorMessage.value = ''
    if (authStore.isGuest) {
      showAuthModal.value = true
      return
    }
    if (!newPostContent.value.trim()) return
    posting.value = true
    try {
      await communityStore.createPost(newPostContent.value.trim())
      newPostContent.value = ''
      showNewPost.value = false
    } catch (e: any) {
      showError(e.message || 'Gagal mengirim cerita.')
    } finally {
      posting.value = false
    }
  }

  const handleReact = async (postId: string, type: ReactionType) => {
    if (authStore.isGuest) {
      showAuthModal.value = true
      return
    }
    try {
      await communityStore.reactToPost(postId, type)
    } catch (e) {
      console.error(e)
    }
  }

  const redirectToRegister = async () => {
    showAuthModal.value = false
    await authStore.logout()
    await navigateTo('/auth/register')
  }

  onMounted(() => {
    communityStore.fetchPosts()
    communityStore.subscribeToNewPosts()
  })
</script>