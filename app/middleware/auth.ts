export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()

  const publicRoutes = [
    '/auth/login',
    '/auth/register',
  ]

  if (publicRoutes.includes(to.path)) {
    return
  }

  // no user
  if (!authStore.user && !authStore.isGuest) {
    return navigateTo('/auth/login')
  }

  // ensure profile loaded
  if (!authStore.profile) {
    await authStore.fetchProfile()
  }

  // onboarding skip
  if (to.path === '/onboarding') {
    if (authStore.isGuest) {
      return navigateTo('/dashboard')
    }
    return
  }

  // no username
  if (!authStore.profile?.username) {
    if (authStore.isGuest) {
      return navigateTo('/dashboard')
    }
    return navigateTo('/onboarding')
  }
})