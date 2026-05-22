import { defineStore } from 'pinia'
import type { MoodEntry, MoodType } from '~/types'
export const useMoodStore = defineStore('mood', () => {
    const getLocalDateString = (dateObj: Date = new Date()) => {
        const year = dateObj.getFullYear()
        const month = String(dateObj.getMonth() + 1).padStart(2, '0')
        const day = String(dateObj.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    const client = useSupabaseClient()
    const authStore = useAuthStore()
    const moods = ref<MoodEntry[]>([])
    const loading = ref(true)
    const fetchMoods = async (limit = 30) => {
        loading.value = true
        try {
            if (authStore.isGuest) {
                if (typeof window !== 'undefined') {
                    const moodsRaw = localStorage.getItem('rt_guest_moods')
                    if (moodsRaw) {
                        try {
                            moods.value = JSON.parse(moodsRaw) as MoodEntry[]
                        } catch (e) {
                            console.error(e)
                            moods.value = []
                        }
                    } else {
                        moods.value = []
                    }
                }
                return
            }
            const userId = await authStore.getUserId()
            if (!userId) return
            const { data, error } = await client
                .from('mood_entries')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(limit)
            if (error) throw error
            moods.value = data as MoodEntry[]
        } catch (e) {
            console.error('Failed to fetch moods:', e)
        } finally {
            loading.value = false
        }
    }
    const submitMood = async (mood: MoodType, rawNote: string | null = null) => {
        let note = rawNote
        if (note !== null && note !== undefined) {
            note = sanitizeClientInput(note)
            if (note.length > 300) {
                throw new Error('Catatan mood maksimal 300 karakter. 🍃')
            }
        }
        if (authStore.isGuest) {
            const today = getLocalDateString()
            const mockEntry: MoodEntry = {
                id: crypto.randomUUID(),
                user_id: 'guest-user',
                mood,
                note,
                date: today,
                created_at: new Date().toISOString()
            }
            // Update local state
            const existingIndex = moods.value.findIndex((m) => m.date === today)
            if (existingIndex >= 0) {
                moods.value[existingIndex] = mockEntry
            } else {
                moods.value.unshift(mockEntry)
            }
            if (typeof window !== 'undefined') {
                localStorage.setItem('rt_guest_moods', JSON.stringify(moods.value))
            }
            return mockEntry
        }
        const userId = await authStore.getUserId()
        if (!userId) throw new Error('Sesi pengguna tidak ditemukan. Silakan masuk kembali.')
        const today = getLocalDateString()
        const { data, error } = await client
            .from('mood_entries')
            .upsert(
                {
                    user_id: userId,
                    mood,
                    note,
                    date: today,
                },
                { onConflict: 'user_id,date' }
            )
            .select()
            .single()
        if (error) throw error
        // Update local state
        const existingIndex = moods.value.findIndex((m) => m.date === today)
        if (existingIndex >= 0) {
            moods.value[existingIndex] = data as MoodEntry
        } else {
            moods.value.unshift(data as MoodEntry)
        }
        return data
    }
    const todayMood = computed(() => {
        const today = getLocalDateString()
        return moods.value.find((m) => m.date === today)
    })
    const weeklyMoods = computed(() => {
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return moods.value.filter((m) => new Date(m.created_at) >= weekAgo)
    })
    const moodStats = computed(() => {
        if (moods.value.length === 0) return null
        const moodScores: Record<string, number> = {
            sangat_baik: 5,
            baik: 4,
            biasa: 3,
            sedih: 2,
            sangat_sedih: 1,
            cemas: 2,
            marah: 2,
            lelah: 2,
        }
        const scores = moods.value.map((m) => moodScores[m.mood] || 3)
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length
        // Calculate streak
        let streak = 0
        const sortedDates = moods.value
            .map((m) => m.date)
            .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
        const today = getLocalDateString()
        let checkDate = today
        for (const date of sortedDates) {
            if (date === checkDate) {
                streak++
                const prev = new Date(checkDate)
                prev.setDate(prev.getDate() - 1)
                checkDate = getLocalDateString(prev)
            } else {
                break
            }
        }
        return {
            total: moods.value.length,
            average: avg,
            streak,
        }
    })
    return {
        moods,
        loading,
        fetchMoods,
        submitMood,
        todayMood,
        weeklyMoods,
        moodStats,
    }
})