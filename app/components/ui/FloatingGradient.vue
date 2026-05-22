<script setup lang="ts">
// Ambient decorative gradient orbs
</script>

<template>
  <div class="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
    <!-- Primary orb -->
    <div
      class="absolute w-[500px] h-[500px] rounded-full opacity-20 animate-float blur-[100px]"
      style="background: radial-gradient(circle, var(--color-primary-300) 0%, transparent 70%); top: -10%; right: -10%;"
    />

    <!-- Lavender orb -->
    <div
      class="absolute w-[400px] h-[400px] rounded-full opacity-15 animate-float blur-[80px]"
      style="background: radial-gradient(circle, var(--color-lavender-300) 0%, transparent 70%); bottom: 10%; left: -5%; animation-delay: -2s;"
    />

    <!-- Calm teal orb -->
    <div
      class="absolute w-[350px] h-[350px] rounded-full opacity-10 animate-float blur-[90px]"
      style="background: radial-gradient(circle, var(--color-calm-300) 0%, transparent 70%); top: 40%; right: 20%; animation-delay: -4s;"
    />

    <!-- Subtle secondary orb -->
    <div
      class="absolute w-[300px] h-[300px] rounded-full opacity-10 animate-float blur-[70px]"
      style="background: radial-gradient(circle, var(--color-secondary-300) 0%, transparent 70%); bottom: -5%; right: 30%; animation-delay: -3s;"
    />
  </div>
</template>
