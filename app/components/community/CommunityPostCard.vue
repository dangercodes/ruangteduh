<template>
  <GlassCard variant="solid" padding="md" :hover="true">
    <div class="space-y-3">
      <!-- Header -->
      <div class="flex items-center gap-3">
        <span class="text-2xl">{{ post.profiles?.avatar_emoji || '🌿' }}</span>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-text-primary truncate">
            {{ post.anonymous_name }}
          </p>
          <p class="text-xs text-text-muted">{{ formattedDate }}</p>
        </div>
      </div>

      <!-- Content -->
      <p class="text-sm text-text-primary leading-relaxed whitespace-pre-wrap break-words">
        {{ post.content }}
      </p>

      <!-- Actions -->
      <div class="flex items-center gap-4 pt-2 border-t border-border-soft/50">
        <button
          @click="$emit('react', 'support')"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
          :class="post.user_reaction?.type === 'support'
            ? 'bg-primary-100 text-primary-600'
            : 'text-text-muted hover:bg-surface-dim hover:text-text-secondary'"
        >
          <span>💪</span>
          <span>{{ $t('community.support') }}</span>
          <span v-if="post.support_count" class="text-[11px]">{{ post.support_count }}</span>
        </button>

        <button
          @click="$emit('react', 'hug')"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
          :class="post.user_reaction?.type === 'hug'
            ? 'bg-lavender-100 text-lavender-500'
            : 'text-text-muted hover:bg-surface-dim hover:text-text-secondary'"
        >
          <span>🤗</span>
          <span>{{ $t('community.hug') }}</span>
          <span v-if="post.hug_count" class="text-[11px]">{{ post.hug_count }}</span>
        </button>

        <NuxtLink
          :to="`/community/${post.id}`"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-text-muted hover:bg-surface-dim hover:text-text-secondary transition-all duration-200 ml-auto"
        >
          <span>💬</span>
          <span>{{ $t('community.comment') }}</span>
          <span v-if="post.comment_count" class="text-[11px]">{{ post.comment_count }}</span>
        </NuxtLink>
      </div>
    </div>
  </GlassCard>
</template>

<script setup lang="ts">
import type { CommunityPost } from '~/types'

interface Props {
  post: CommunityPost
}

const props = defineProps<Props>()
const { t } = useI18n()

defineEmits<{
  react: [type: 'support' | 'hug']
}>()

const formattedDate = computed(() => {
  const date = new Date(props.post.created_at)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)

  if (minutes < 1) return t('common.justNow')
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return t('common.daysAgo', { count: days })

  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
})
</script>
