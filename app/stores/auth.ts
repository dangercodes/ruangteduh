import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const client = useSupabaseClient()
  const user = useSupabaseUser()

  const loading = ref(false)
  const error = ref<string | null>(null)
  const registrationSuccess = ref(false)

  // GLOBAL PROFILE STATE
  const profile = ref<any | null>(null)
  const profileLoading = ref(false)

  // GUEST MODE STATE — use cookie so it's available during SSR
  const guestCookie = useCookie('rt_is_guest', { maxAge: 60 * 60 * 24 * 30 }) // 30 days
  const isGuest = ref(guestCookie.value === 'true')
  if (isGuest.value && !profile.value) {
    profile.value = {
      id: 'guest-user',
      username: 'Tamu Teduh',
      avatar_emoji: '🌿',
      created_at: new Date().toISOString()
    }
  }

  // =========================
  // USER ID
  // =========================
  const getUserId = async (): Promise<string | undefined> => {
    if (isGuest.value) return 'guest-user'
    if (user.value?.id) return user.value.id

    // If not hydrated/available yet, wait for useSupabaseUser to populate (up to 3 seconds)
    if (!user.value) {
      await new Promise<void>((resolve) => {
        const check = () => {
          if (user.value?.id) {
            resolve()
            return true
          }
          return false
        }
        if (check()) return

        const unwatch = watch(user, (newUser) => {
          if (newUser?.id) {
            unwatch()
            resolve()
          }
        })

        // Timeout fallback after 3 seconds
        setTimeout(() => {
          unwatch()
          resolve()
        }, 3000)
      })
    }

    if (user.value?.id) return user.value.id

    const { data: userData } = await client.auth.getUser()

    if (userData?.user?.id) {
      return userData.user.id
    }

    return undefined
  }

  // =========================
  // FETCH PROFILE
  // =========================
  const fetchProfile = async (force = false) => {
    try {
      if (isGuest.value) {
        if (!profile.value) {
          profile.value = {
            id: 'guest-user',
            username: 'Tamu Teduh',
            avatar_emoji: '🌿',
            created_at: new Date().toISOString()
          }
        }
        return profile.value
      }

      // already cached
      if (profile.value && !force) {
        return profile.value
      }

      const userId = await getUserId()

      if (!userId) {
        profile.value = null
        return null
      }

      profileLoading.value = true

      const { data, error: profileError } = await client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (profileError) {
        console.error('fetchProfile error:', profileError)
        return null
      }

      profile.value = data

      return data
    } catch (err) {
      console.error('fetchProfile exception:', err)
      return null
    } finally {
      profileLoading.value = false
    }
  }

  // =========================
  // REFRESH PROFILE
  // =========================
  const refreshProfile = async () => {
    return await fetchProfile(true)
  }

  // =========================
  // LOGIN
  // =========================
  const login = async (email: string, password: string) => {
    loading.value = true
    error.value = null

    try {
      const { error: authError } =
        await client.auth.signInWithPassword({
          email,
          password,
        })

      if (authError) {
        throw authError
      }

      // clear guest mode on regular login
      isGuest.value = false
      guestCookie.value = null

      // load profile after login
      await fetchProfile(true)

      await navigateTo('/dashboard')
    } catch (e: any) {
      error.value = e.message || 'Login failed'
    } finally {
      loading.value = false
    }
  }

  // =========================
  // REGISTER
  // =========================
  const register = async (
    email: string,
    password: string
  ) => {
    loading.value = true
    error.value = null
    registrationSuccess.value = false

    try {
      // Dynamically resolve redirect URL to support both local development and production domains.
      const redirectUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/auth/verified`
        : 'http://localhost:3000/auth/verified'

      const { data, error: authError } =
        await client.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
          },
        })

      if (authError) {
        throw authError
      }

      // clear guest mode on regular registration
      isGuest.value = false
      guestCookie.value = null

      // If email confirmation is enabled, session will be null.
      // In that case, do not redirect; instead set registrationSuccess to true.
      if (!data.session) {
        registrationSuccess.value = true
        return
      }

      // Otherwise, the user is logged in automatically (email confirmation disabled)
      await fetchProfile(true)
      await navigateTo('/onboarding')
    } catch (e: any) {
      error.value = e.message || 'Registration failed'
    } finally {
      loading.value = false
    }
  }

  // =========================
  // LOGIN GUEST
  // =========================
  const loginGuest = async () => {
    loading.value = true
    error.value = null

    try {
      isGuest.value = true
      guestCookie.value = 'true'
      profile.value = {
        id: 'guest-user',
        username: 'Tamu Teduh',
        avatar_emoji: '🌿',
        created_at: new Date().toISOString()
      }
      await navigateTo('/dashboard')
    } catch (e: any) {
      error.value = e.message || 'Gagal masuk sebagai tamu'
    } finally {
      loading.value = false
    }
  }

  // =========================
  // LOGOUT
  // =========================
  const logout = async () => {
    loading.value = true

    try {
      if (isGuest.value) {
        isGuest.value = false
        guestCookie.value = null
        if (typeof window !== 'undefined') {
          // Clear other guest data too
          localStorage.removeItem('rt_guest_moods')
          localStorage.removeItem('rt_guest_chat_sessions')
          localStorage.removeItem('rt_guest_chat_messages')
        }
        profile.value = null
        await navigateTo('/auth/login')
        return
      }

      await client.auth.signOut()

      profile.value = null

      await navigateTo('/auth/login')
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  // Automatically watch user changes to fetch/clear profile
  watch(
    user,
    async (newUser) => {
      if (isGuest.value) return
      if (newUser) {
        if (!profile.value) {
          await fetchProfile()
        }
      } else {
        profile.value = null
      }
    },
    { immediate: true }
  )

  return {
    user,
    profile,
    profileLoading,
    loading,
    error,
    isGuest,

    registrationSuccess,

    getUserId,
    fetchProfile,
    refreshProfile,

    login,
    register,
    loginGuest,
    logout,
  }
})