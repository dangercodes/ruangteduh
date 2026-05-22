<template>
  <!-- Floating Mood Button -->
  <Teleport to="body">
    <button
      @click="isOpen = true"
      class="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 w-14 h-14 cursor-pointer rounded-full gradient-primary text-white shadow-float flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-glow-primary active:scale-95"
      :title="$t('dashboard.quickActions.mood')"
    >
      <span class="text-2xl animate-breathing">🎭</span>
    </button>
    <!-- Modal overlay -->
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" @click.self="isOpen = false">
        <div class="fixed inset-0 bg-black/20 backdrop-blur-sm" @click="isOpen = false" />
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 translate-y-8 sm:translate-y-0 sm:scale-95"
          enter-to-class="opacity-100 translate-y-0 sm:scale-100"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 translate-y-0 sm:scale-100"
          leave-to-class="opacity-0 translate-y-8 sm:translate-y-0 sm:scale-95"
        >
          <div
            v-if="isOpen"
            class="relative w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl shadow-float p-6 space-y-5 z-10"
          >
            <!-- Close button -->
            <button
              @click="isOpen = false"
              class="absolute top-4 right-4 p-1 rounded-full hover:bg-surface-dim transition-colors"
            >
              <svg class="w-5 h-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <!-- Emotion selector -->
            <EmotionSelector v-model="selectedMood" />
            <!-- Note input -->
            <div v-if="selectedMood">
              <textarea
                v-model="note"
                :placeholder="$t('mood.notePlaceholder')"
                class="w-full px-4 py-3 bg-surface-dim rounded-xl border-0 text-sm text-text-primary placeholder-text-muted resize-none focus:ring-2 focus:ring-primary-300 focus:bg-white transition-all"
                rows="3"
              />
            </div>
            <!-- Submit -->
            <SoftButton
              v-if="selectedMood"
              variant="primary"
              size="lg"
              class="w-full"
              :loading="saving"
              @click="saveMood"
            >
              {{ $t('mood.submit') }}
            </SoftButton>
            <!-- Success feedback -->
            <div v-if="saved" class="text-center animate-scale-in">
              <p class="text-sm font-medium text-success">{{ $t('mood.saved') }}</p>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
<script setup lang="ts">
    import type { MoodType } from '~/types'
    const isOpen = ref(false)
    const selectedMood = ref<MoodType | null>(null)
    const note = ref('')
    const saving = ref(false)
    const saved = ref(false)

    const moodStore = useMoodStore()
    const saveMood = async () => {
    if (!selectedMood.value) return
    saving.value = true
    try {
        await moodStore.submitMood(selectedMood.value, note.value || null)
        saved.value = true
        setTimeout(() => {
        isOpen.value = false
        saved.value = false
        selectedMood.value = null
        note.value = ''
        }, 1500)
    } catch (error) {
        console.error('Failed to save mood:', error)
    } finally {
        saving.value = false
    }
    }
    // Reset state when closing
    watch(isOpen, (open) => {
    if (!open) {
        setTimeout(() => {
        selectedMood.value = null
        note.value = ''
        saved.value = false
        }, 200)
    }
    })
</script>