<template>
  <div class="flex gap-3 py-3 animate-slide-up">
    <span class="text-xl flex-shrink-0">{{ comment.profiles?.avatar_emoji || '🌿' }}</span>
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2 mb-1">
        <span class="text-sm font-medium text-text-primary">{{ comment.anonymous_name }}</span>
        <span class="text-xs text-text-muted">{{ formattedDate }}</span>
      </div>
      <p class="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap break-words">
        {{ comment.content }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CommunityComment } from '~/types'

interface Props {
  comment: CommunityComment
}

const props = defineProps<Props>()
const { t } = useI18n()

const formattedDate = computed(() => {
  const date = new Date(props.comment.created_at)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)

  if (minutes < 1) return t('common.justNow')
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`

  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
})
</script>
