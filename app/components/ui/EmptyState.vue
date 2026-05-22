<template>
  <div class="flex flex-col items-center justify-center py-12 px-6 text-center animate-fade-in">
    <div class="text-5xl mb-4">
      {{ icon }}
    </div>
    <h3 class="text-lg font-semibold text-text-primary mb-2">
      {{ title }}
    </h3>
    <p class="text-sm text-text-muted max-w-xs mb-6 leading-relaxed">
      {{ description }}
    </p>
    <SoftButton
      v-if="actionLabel"
      :variant="actionVariant"
      @click="handleAction"
    >
      {{ actionLabel }}
    </SoftButton>
  </div>
</template>

<script setup lang="ts">
interface Props {
  icon?: string
  title: string
  description: string
  actionLabel?: string
  actionTo?: string
  actionVariant?: 'primary' | 'secondary' | 'ghost' | 'outline'
}

const props = withDefaults(defineProps<Props>(), {
  icon: '🌱',
  actionVariant: 'primary',
})

const router = useRouter()

const handleAction = () => {
  if (props.actionTo) {
    router.push(props.actionTo)
  }
}
</script>
