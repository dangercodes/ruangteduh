<template>
  <div
    :class="[
      'rounded-2xl transition-all duration-300',
      variantClasses,
      hover ? 'hover:shadow-large hover:-translate-y-0.5 cursor-pointer' : '',
      paddingClasses,
    ]"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'glass' | 'frosted' | 'solid' | 'outline'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'glass',
  padding: 'md',
  hover: false,
})

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'glass':
      return 'glass shadow-soft'
    case 'frosted':
      return 'glass-strong shadow-medium'
    case 'solid':
      return 'bg-white shadow-soft border border-border-soft'
    case 'outline':
      return 'border border-border-soft bg-transparent'
    default:
      return 'glass shadow-soft'
  }
})

const paddingClasses = computed(() => {
  switch (props.padding) {
    case 'none': return 'p-0'
    case 'sm': return 'p-3 sm:p-4'
    case 'md': return 'p-4 sm:p-6'
    case 'lg': return 'p-6 sm:p-8'
    default: return 'p-4 sm:p-6'
  }
})
</script>
