<template>
  <div class="flex flex-col h-[calc(100vh-10rem)] md:h-[calc(100vh-6rem)]">
    <!-- Chat Header -->
    <div class="flex items-center gap-3 pb-4 border-b border-border-soft/50 animate-slide-down">
      <NuxtLink to="/chat" class="p-2 rounded-xl hover:bg-surface-dim transition-colors">
        <svg class="w-5 h-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 19l-7-7 7-7" />
        </svg>
      </NuxtLink>
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-xl bg-primary-100 flex items-center justify-center">🌿</div>
        <div>
          <p class="text-sm font-medium text-text-primary">Teduh</p>
          <p v-if="typing" class="text-xs text-primary-500 animate-pulse-gentle">{{ $t('chat.typing') }}</p>
        </div>
      </div>
    </div>
    <!-- Messages Area -->
    <div
      ref="messagesContainer"
      class="flex-1 overflow-y-auto py-4 space-y-4 scroll-smooth"
    >
      <!-- Welcome message (shown when no messages) -->
      <div v-if="messages.length === 0 && !loading" class="flex flex-col items-center justify-center h-full text-center space-y-6 animate-fade-in">
        <div class="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-glow-primary animate-breathing">
          <span class="text-3xl">🌿</span>
        </div>
        <div class="space-y-2 max-w-sm">
          <h2 class="text-lg font-semibold text-text-primary">{{ $t('chat.welcome.title') }}</h2>
          <p class="text-sm text-text-secondary">{{ $t('chat.welcome.message') }}</p>
        </div>
        <!-- Suggestion chips -->
        <div class="flex flex-wrap justify-center gap-2">
          <button
            v-for="(suggestion, i) in suggestions"
            :key="i"
            @click="sendSuggestion(suggestion)"
            class="px-4 py-2 rounded-full text-sm bg-white border border-border-soft text-text-secondary hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200"
          >
            {{ suggestion }}
          </button>
        </div>
      </div>
      <!-- Loading skeleton -->
      <LoadingSkeleton v-if="loading" variant="chat" />
      <!-- Message bubbles -->
      <template v-else>
        <AIChatBubble
          v-for="msg in messages"
          :key="msg.id"
          :content="msg.content"
          :role="msg.role"
          :timestamp="msg.created_at"
        />
        <!-- Typing indicator -->
        <AIChatBubble
          v-if="typing"
          content=""
          role="assistant"
          :typing="true"
        />
      </template>
      <!-- Safety notice -->
      <Transition
        enter-active-class="transition-all duration-300"
        enter-from-class="opacity-0 translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
      >
        <div v-if="showSafetyNotice" class="mx-4 p-4 rounded-2xl bg-danger/5 border border-danger/20 animate-scale-in">
          <div class="flex items-start gap-3">
            <span class="text-2xl">❤️</span>
            <div class="space-y-2">
              <h3 class="text-sm font-semibold text-danger">{{ $t('chat.safety.title') }}</h3>
              <p class="text-sm text-text-secondary">{{ $t('chat.safety.message') }}</p>
              <a
                href="tel:119"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-danger/10 text-danger text-sm font-medium hover:bg-danger/20 transition-colors"
              >
                📞 {{ $t('chat.safety.hotline') }}
              </a>
              <button
                @click="showSafetyNotice = false"
                class="block text-xs text-text-muted hover:text-text-secondary transition-colors mt-1"
              >
                {{ $t('chat.safety.continue') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </div>
    <!-- Chat Input Error -->
    <Transition
      enter-active-class="transition-all duration-300"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div v-if="errorMessage" class="mx-4 mb-2 flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-danger/10 text-danger text-sm font-medium border border-danger/20">
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
    <!-- Chat Input -->
    <ChatInput
      :disabled="sending"
      @send="handleSend"
    />
  </div>
</template>
<script setup lang="ts">
  import { storeToRefs } from 'pinia'
  definePageMeta({
    layout: 'default',
    middleware: ['auth'],
    hideFloatingMood: true,
  })
  useHead({
    title: 'Chat — RuangTeduh',
  })
  const route = useRoute()
  const sessionId = route.params.id as string
  const chatStore = useChatStore()
  const { messages, loading, sending, typing } = storeToRefs(chatStore)
  const { checkMessage } = useSafetyCheck()
  const { t } = useI18n()
  const messagesContainer = ref<HTMLElement>()
  const showSafetyNotice = ref(false)
  const errorMessage = ref('')
  let errorTimeout: ReturnType<typeof setTimeout> | null = null

  const showError = (msg: string) => {
    errorMessage.value = msg
    if (errorTimeout) clearTimeout(errorTimeout)
    errorTimeout = setTimeout(() => {
      errorMessage.value = ''
    }, 5000)
  }

  const suggestions = computed(() => {
    const key = 'chat.welcome.suggestions'
    return [
      t(`${key}[0]`),
      t(`${key}[1]`),
      t(`${key}[2]`),
      t(`${key}[3]`),
    ]
  })
  const scrollToBottom = () => {
    nextTick(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    })
  }
  const handleSend = async (message: string) => {
    errorMessage.value = ''
    // Check for crisis content
    const safetyResult = checkMessage(message)
    if (safetyResult.isCrisis) {
      showSafetyNotice.value = true
    }
    try {
      await chatStore.sendMessage(message, sessionId)
      scrollToBottom()
    } catch (e: any) {
      showError(e.message || 'Gagal mengirim pesan.')
    }
  }
  const sendSuggestion = (text: string) => {
    handleSend(text)
  }
  // Scroll to bottom when messages change
  watch(
    () => messages.value.length,
    () => scrollToBottom()
  )
  watch(typing, () => scrollToBottom())
  onMounted(async () => {
    await chatStore.fetchMessages(sessionId)
    scrollToBottom()
    
    // Auto-send prompt if passed in query and the conversation is new
    const preloadedPrompt = route.query.prompt as string
    if (preloadedPrompt && messages.value.length === 0) {
      await handleSend(preloadedPrompt)
    }
  })
</script>