<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between animate-slide-up">
      <h1 class="text-2xl font-bold text-text-primary">{{ $t('chat.title') }}</h1>
      <SoftButton v-if="!loading && sessions.length > 0" variant="primary" @click="startNewChat">
        {{ $t('chat.newChat') }}
      </SoftButton>
    </div>

    <!-- Sessions List -->
    <div v-if="loading" class="space-y-3">
      <LoadingSkeleton variant="card" v-for="i in 3" :key="i" />
    </div>
    
    <div v-else-if="sessions.length === 0" class="animate-fade-in">
      <EmptyState
        icon="💬"
        :title="$t('chat.sessions.title')"
        :description="$t('chat.sessions.empty')"
        :action-label="$t('chat.newChat')"
        @click="startNewChat"
      />
    </div>

    <div v-else class="space-y-3 animate-fade-in">
      <NuxtLink
        v-for="session in sessions"
        :key="session.id"
        :to="`/chat/${session.id}`"
        class="block group"
      >
        <GlassCard variant="solid" padding="md" :hover="true">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-lg flex-shrink-0 group-hover:bg-primary-200 transition-colors animate-pulse-gentle">
              🌿
            </div>
            
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-text-primary truncate">
                {{ session.title }}
              </p>
              <p class="text-xs text-text-muted mt-0.5">
                {{ formatDate(session.updated_at) }}
              </p>
            </div>
            
            <div class="flex items-center gap-1.5">
              <!-- Delete Session Button (visible on hover, fully responsive on mobile) -->
              <button
                @click.stop.prevent="triggerDelete(session.id)"
                class="p-2 rounded-xl text-text-muted hover:text-danger hover:bg-danger/5 transition-all duration-200 opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 cursor-pointer flex items-center justify-center"
                :title="locale === 'id' ? 'Hapus Percakapan' : 'Delete Chat'"
              >
                <svg class="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
              
              <!-- Chevron Arrow -->
              <svg class="w-5 h-5 text-text-muted group-hover:text-primary-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </GlassCard>
      </NuxtLink>
    </div>

    <!-- Beautiful Soft Glassmorphic Delete Confirmation Modal -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-md">
        <GlassCard variant="frosted" padding="lg" class="max-w-sm w-full border border-white/60 shadow-large relative overflow-hidden animate-scale-in">
          <div class="space-y-4">
            <div class="w-12 h-12 rounded-2xl bg-danger/10 text-danger flex items-center justify-center text-2xl mx-auto shadow-soft">
              🗑️
            </div>
            
            <div class="text-center space-y-2">
              <h3 class="text-base font-bold text-text-primary">
                {{ locale === 'id' ? 'Hapus Percakapan?' : 'Delete Conversation?' }}
              </h3>
              <p class="text-xs text-text-secondary leading-relaxed">
                {{ locale === 'id' ? 'Tindakan ini permanen. Semua riwayat pesan di dalam percakapan ini akan dihapus selamanya.' : 'This action is permanent. All message history in this conversation will be deleted forever.' }}
              </p>
            </div>
            
            <div class="flex items-center gap-3 pt-2">
              <button 
                @click="showDeleteConfirm = false" 
                class="flex-1 px-4 py-2.5 rounded-xl border border-border-soft hover:bg-surface-dim font-bold text-xs text-text-secondary transition-all cursor-pointer text-center"
              >
                {{ locale === 'id' ? 'Batal' : 'Cancel' }}
              </button>
              <button 
                @click="confirmDelete" 
                :disabled="deleting"
                class="flex-1 px-4 py-2.5 rounded-xl bg-danger hover:bg-danger/90 text-white font-bold text-xs shadow-glow-primary transition-all cursor-pointer text-center"
              >
                {{ deleting ? (locale === 'id' ? 'Menghapus...' : 'Deleting...') : (locale === 'id' ? 'Hapus' : 'Delete') }}
              </button>
            </div>
          </div>
        </GlassCard>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { storeToRefs } from 'pinia'
  
  definePageMeta({
    layout: 'default',
    middleware: ['auth'],
  })
  
  useHead({
    title: 'Chat AI — RuangTeduh',
  })
  
  const chatStore = useChatStore()
  const { sessions, loading } = storeToRefs(chatStore)
  const { t, locale } = useI18n()

  const sessionToDelete = ref<string | null>(null)
  const showDeleteConfirm = ref(false)
  const deleting = ref(false)
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days === 0) return t('common.today')
    if (days === 1) return t('common.yesterday')
    if (days < 7) return t('common.daysAgo', { count: days })
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  }
  
  const startNewChat = async () => {
    try {
      const session = await chatStore.createSession()
      if (session) {
        await navigateTo(`/chat/${session.id}`)
      }
    } catch (e) {
      console.error('Failed to create chat:', e)
    }
  }

  const triggerDelete = (id: string) => {
    sessionToDelete.value = id
    showDeleteConfirm.value = true
  }

  const confirmDelete = async () => {
    if (!sessionToDelete.value) return
    deleting.value = true
    try {
      await chatStore.deleteSession(sessionToDelete.value)
      showDeleteConfirm.value = false
      sessionToDelete.value = null
    } catch (e) {
      console.error('Failed to confirm deletion:', e)
    } finally {
      deleting.value = false
    }
  }
  
  onMounted(() => {
    chatStore.fetchSessions()
  })
</script>