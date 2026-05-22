import { defineStore } from 'pinia'
import type { Profile, WeeklyStats } from '~/types'
export const useProfileStore = defineStore('profile', () => {
    const client = useSupabaseClient()
    const authStore = useAuthStore()
    const profile = ref<Profile | null>(null)
    const loading = ref(true)

    // Sync with authStore.profile to keep in sync in both directions
    watch(() => authStore.profile, (newProfile) => {
        profile.value = newProfile as Profile | null
    }, { immediate: true })
    const fetchProfile = async () => {
        loading.value = true
        try {
            if (authStore.isGuest) {
                profile.value = {
                    id: 'guest-user',
                    username: 'Tamu Teduh',
                    avatar_emoji: '🌿',
                    created_at: new Date().toISOString()
                } as Profile
                authStore.profile = profile.value
                return
            }
            const userId = await authStore.getUserId()
            if (!userId) return
            const { data, error } = await client
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()
            if (error && error.code !== 'PGRST116') throw error
            profile.value = data as Profile | null
            authStore.profile = data
        } catch (e) {
            console.error('Failed to fetch profile:', e)
        } finally {
            loading.value = false
        }
    }
    const createProfile = async (rawUsername: string, avatarEmoji: string = '🌿') => {
        const validatedUsername = validateLength(rawUsername, 3, 30, 'Username')
        const username = sanitizeClientInput(validatedUsername)
        if (authStore.isGuest) {
            profile.value = {
                id: 'guest-user',
                username,
                avatar_emoji: avatarEmoji,
                created_at: new Date().toISOString()
            } as Profile
            authStore.profile = profile.value
            return profile.value
        }
        const userId = await authStore.getUserId()
        if (!userId) {
            throw new Error('Sesi pengguna tidak ditemukan. Silakan masuk kembali.')
        }
        // Since the database trigger handle_new_user() automatically creates a profile row on signup,
        // we try an upsert first, and fallback to a direct update if there are any RLS or PostgREST upsert conflicts.
        const { data, error } = await client
            .from('profiles')
            .upsert({
                id: userId,
                username,
                avatar_emoji: avatarEmoji,
            })
            .select()
            .single()
        if (error) {
            console.warn('Profile upsert failed, attempting direct update:', error)
            const { data: updateData, error: updateError } = await client
                .from('profiles')
                .update({
                    username,
                    avatar_emoji: avatarEmoji,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', userId)
                .select()
                .single()
            if (updateError) throw updateError
            profile.value = updateData as Profile
            authStore.profile = updateData
            return updateData
        }
        profile.value = data as Profile
        authStore.profile = data
        return data
    }
    const updateProfile = async (updates: Partial<Pick<Profile, 'username' | 'avatar_emoji'>>) => {
        const sanitizedUpdates = { ...updates }
        if (sanitizedUpdates.username !== undefined) {
            const validatedUsername = validateLength(sanitizedUpdates.username, 3, 30, 'Username')
            sanitizedUpdates.username = sanitizeClientInput(validatedUsername)
        }

        if (authStore.isGuest) {
            if (profile.value) {
                profile.value = {
                    ...profile.value,
                    ...sanitizedUpdates,
                    updated_at: new Date().toISOString(),
                } as Profile
                authStore.profile = profile.value
            }
            return profile.value
        }
        const userId = await authStore.getUserId()
        if (!userId) return
        const { data, error } = await client
            .from('profiles')
            .update({
                ...sanitizedUpdates,
                updated_at: new Date().toISOString(),
            })
            .eq('id', userId)
            .select()
            .single()
        if (error) throw error
        profile.value = data as Profile
        authStore.profile = data
        return data
    }
    const fetchWeeklyStats = async (): Promise<WeeklyStats> => {
        if (authStore.isGuest) {
            const weekAgo = new Date()
            weekAgo.setDate(weekAgo.getDate() - 7)

            let guestMoodsCount = 0
            let guestChatsCount = 0

            if (typeof window !== 'undefined') {
                const moodsRaw = localStorage.getItem('rt_guest_moods')
                if (moodsRaw) {
                    try {
                        const parsed = JSON.parse(moodsRaw)
                        if (Array.isArray(parsed)) {
                            guestMoodsCount = parsed.filter(m => new Date(m.created_at || m.date) >= weekAgo).length
                        }
                    } catch (e) {
                        console.error(e)
                    }
                }

                const chatsRaw = localStorage.getItem('rt_guest_chat_sessions')
                if (chatsRaw) {
                    try {
                        const parsed = JSON.parse(chatsRaw)
                        if (Array.isArray(parsed)) {
                            guestChatsCount = parsed.filter(c => new Date(c.created_at) >= weekAgo).length
                        }
                    } catch (e) {
                        console.error(e)
                    }
                }
            }

            return {
                moodEntries: guestMoodsCount,
                chatSessions: guestChatsCount,
                communityPosts: 0
            }
        }
        const userId = await authStore.getUserId()
        if (!userId) return { moodEntries: 0, chatSessions: 0, communityPosts: 0 }
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        const weekAgoISO = weekAgo.toISOString()
        const [moodResult, chatResult, postResult] = await Promise.all([
            client
                .from('mood_entries')
                .select('id', { count: 'exact', head: true })
                .eq('user_id', userId)
                .gte('created_at', weekAgoISO),
            client
                .from('chat_sessions')
                .select('id', { count: 'exact', head: true })
                .eq('user_id', userId)
                .gte('created_at', weekAgoISO),
            client
                .from('community_posts')
                .select('id', { count: 'exact', head: true })
                .eq('user_id', userId)
                .gte('created_at', weekAgoISO),
        ])
        return {
            moodEntries: moodResult.count || 0,
            chatSessions: chatResult.count || 0,
            communityPosts: postResult.count || 0,
        }
    }
    return {
        profile,
        loading,
        fetchProfile,
        createProfile,
        updateProfile,
        fetchWeeklyStats,
    }
})
