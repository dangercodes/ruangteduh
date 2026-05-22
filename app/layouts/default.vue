<template>
  <div class="min-h-screen gradient-surface relative">
    <FloatingGradient />
    <CalmNavbar />

    <main class="pt-20 pb-24 md:pb-8 px-4 sm:px-6">
      <div class="max-w-5xl mx-auto">
        <slot />
      </div>
    </main>

    <MobileTabBar />
    <FloatingMoodButton />
  </div>
</template>
