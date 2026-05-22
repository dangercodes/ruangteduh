export default defineNuxtRouteMiddleware(async () => {
  const authStore = useAuthStore()
  if (authStore.isGuest) {
    return navigateTo('/dashboard')
  }

  const user = useSupabaseUser()
  const client = useSupabaseClient()

  // Fallback: If the reactive Nuxt user ref is not hydrated yet during transition tick,
  // securely fetch the user from Supabase Auth server.
  let activeUser = user.value
  if (!activeUser) {
    const { data } = await client.auth.getUser()
    if (data?.user) {
      activeUser = data.user
    }
  }

  if (activeUser && activeUser.id) {
    return navigateTo('/dashboard')
  }
})
