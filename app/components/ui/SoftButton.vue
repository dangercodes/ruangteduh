<template>
  <button
    :class="[
      'inline-flex items-center justify-center font-medium cursor-pointer transition-all duration-200 focus-ring',
      'active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
      variantClasses,
      sizeClasses,
      rounded ? 'rounded-full' : 'rounded-xl',
    ]"
    :disabled="disabled || loading"
    v-bind="$attrs"
  >
    <svg
      v-if="loading"
      class="animate-spin -ml-1 mr-2 h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
    <slot />
  </button>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'calm'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  disabled?: boolean
  rounded?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  loading: false,
  disabled: false,
  rounded: false,
})

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'primary':
      return 'bg-primary-500 text-white shadow-soft hover:bg-primary-600 hover:shadow-glow-primary'
    case 'secondary':
      return 'bg-secondary-100 text-primary-700 hover:bg-secondary-200'
    case 'ghost':
      return 'bg-transparent text-text-secondary hover:bg-surface-dim hover:text-text-primary'
    case 'danger':
      return 'bg-danger/10 text-danger hover:bg-danger/20'
    case 'outline':
      return 'bg-transparent border border-border-soft text-text-secondary hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50'
    case 'calm':
      return 'bg-calm-100 text-calm-700 hover:bg-calm-200'
    default:
      return 'bg-primary-500 text-white shadow-soft hover:bg-primary-600'
  }
})

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm': return 'px-3 py-1.5 text-sm gap-1.5'
    case 'md': return 'px-5 py-2.5 text-sm gap-2'
    case 'lg': return 'px-6 py-3 text-base gap-2.5'
    case 'xl': return 'px-8 py-4 text-lg gap-3'
    default: return 'px-5 py-2.5 text-sm gap-2'
  }
})
</script>
