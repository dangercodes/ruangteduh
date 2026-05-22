<template>
  <div class="space-y-6">
    <!-- Back button -->
    <div class="animate-slide-down">
      <NuxtLink to="/community" class="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary-500 transition-colors">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 19l-7-7 7-7" />
        </svg>
        {{ $t('common.back') }}
      </NuxtLink>
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

    <!-- Post Detail -->
    <div v-if="loadingPost">
      <LoadingSkeleton variant="card" />
    </div>
    <template v-else-if="post">
      <CommunityPostCard
        :post="post"
        @react="(type) => handleReact(type)"
      />
      <!-- Comments Section -->
      <div class="space-y-4">
        <h2 class="text-lg font-semibold text-text-primary">
          {{ $t('community.comments') }}
          <span v-if="comments.length" class="text-text-muted text-sm font-normal">({{ comments.length }})</span>
        </h2>
        <!-- Comment input -->
        <GlassCard variant="frosted" padding="sm">
          <Transition
            enter-active-class="transition-all duration-300"
            enter-from-class="opacity-0 -translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition-all duration-200"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-2"
          >
            <div v-if="errorMessage" class="flex items-center justify-between gap-2 px-3 py-2 mb-2 rounded-lg bg-danger/10 text-danger text-sm font-medium border border-danger/20">
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
          <div class="flex gap-2">
            <input
              type="text"
              v-model="newComment"
              :placeholder="$t('community.commentPlaceholder')"
              class="flex-1 px-4 py-2.5 bg-surface-dim rounded-xl border-0 text-sm text-text-primary placeholder-text-muted transition-all"
              @keydown.enter="handleAddComment"
            />
            <SoftButton
              variant="primary"
              :loading="addingComment"
              :disabled="!newComment.trim()"
              @click="handleAddComment"
            >
              {{ $t('community.submitComment') }}
            </SoftButton>
          </div>
        </GlassCard>
        <!-- Comments List -->
        <div v-if="comments.length === 0">
          <EmptyState
            icon="🤗"
            :title="$t('community.comments')"
            :description="$t('community.emptyComments')"
          />
        </div>
        <div v-else class="divide-y divide-border-soft/50">
          <CommentCard
            v-for="comment in comments"
            :key="comment.id"
            :comment="comment"
          />
        </div>
      </div>
    </template>

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
  import type { CommunityPost, CommunityComment, ReactionType } from '~/types'
  definePageMeta({
    layout: 'default',
    middleware: ['auth'],
  })
  useHead({
    title: 'Postingan — RuangTeduh',
  })
  const route = useRoute()
  const postId = route.params.id as string
  const client = useSupabaseClient()
  const authStore = useAuthStore()
  const communityStore = useCommunityStore()

  const post = ref<CommunityPost | null>(null)
  const comments = ref<CommunityComment[]>([])
  const loadingPost = ref(true)
  const newComment = ref('')
  const addingComment = ref(false)
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
  const fetchPost = async () => {
    loadingPost.value = true
    try {
      const { data, error } = await client
        .from('community_posts')
        .select(`*, profiles (avatar_emoji), comment_count:community_comments(count)`)
        .eq('id', postId)
        .single()
      if (error) throw error
      // Get user reaction
      let userReaction = null
      const userId = await authStore.getUserId()
      if (userId) {
        const { data: reaction } = await client
          .from('post_reactions')
          .select('*')
          .eq('post_id', postId)
          .eq('user_id', userId)
          .single()
        userReaction = reaction
      }

      post.value = {
        ...data,
        comment_count: data.comment_count?.[0]?.count || 0,
        user_reaction: userReaction,
      } as CommunityPost
    } catch (e) {
      console.error(e)
    } finally {
      loadingPost.value = false
    }
  }
  const loadComments = async () => {
    try {
      comments.value = await communityStore.fetchComments(postId)
    } catch (e) {
      console.error(e)
    }
  }
  const handleReact = async (type: ReactionType) => {
    if (!post.value) return
    if (authStore.isGuest) {
      showAuthModal.value = true
      return
    }
    try {
      await communityStore.reactToPost(post.value.id, type)
      // Refresh post
      await fetchPost()
    } catch (e) {
      console.error(e)
    }
  }
  const handleAddComment = async () => {
    errorMessage.value = ''
    if (authStore.isGuest) {
      showAuthModal.value = true
      return
    }
    if (!newComment.value.trim()) return
    addingComment.value = true
    try {
      const comment = await communityStore.addComment(postId, newComment.value.trim())
      if (comment) {
        comments.value.push(comment)
      }
      newComment.value = ''
    } catch (e: any) {
      showError(e.message || 'Gagal mengirim komentar.')
    } finally {
      addingComment.value = false
    }
  }
  const redirectToRegister = async () => {
    showAuthModal.value = false
    await authStore.logout()
    await navigateTo('/auth/register')
  }
  onMounted(() => {
    fetchPost()
    loadComments()
  })
</script>