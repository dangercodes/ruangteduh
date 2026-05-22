import { defineStore } from 'pinia'
import type { JournalEntry, MoodType } from '~/types'

export const useJournalStore = defineStore('journal', () => {
    const getLocalDateString = (dateObj: Date = new Date()) => {
        const year = dateObj.getFullYear()
        const month = String(dateObj.getMonth() + 1).padStart(2, '0')
        const day = String(dateObj.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    const client = useSupabaseClient()
    const authStore = useAuthStore()
    const journals = ref<JournalEntry[]>([])
    const loading = ref(true)

    // Fetch all journals
    const fetchJournals = async () => {
        loading.value = true
        try {
            if (authStore.isGuest) {
                if (typeof window !== 'undefined') {
                    const raw = localStorage.getItem('rt_guest_journals')
                    if (raw) {
                        try {
                            journals.value = JSON.parse(raw) as JournalEntry[]
                        } catch (e) {
                            console.error('Failed to parse guest journals:', e)
                            journals.value = []
                        }
                    } else {
                        journals.value = []
                    }
                }
                return
            }

            const userId = await authStore.getUserId()
            if (!userId) return

            const { data, error } = await client
                .from('journal_entries')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })

            if (error) throw error
            journals.value = (data || []) as JournalEntry[]
        } catch (e) {
            console.error('Failed to fetch journals:', e)
        } finally {
            loading.value = false
        }
    }

    // Submit journal (handles both INSERT and UPDATE)
    const submitJournal = async (
        rawTitle: string | null,
        rawContent: string,
        moodTag: MoodType | null,
        id?: string
    ) => {
        // Sanitize input
        let title = rawTitle ? sanitizeClientInput(rawTitle).trim() : null
        if (title === '') title = null

        const content = sanitizeClientInput(rawContent).trim()

        // Validation
        if (!content) {
            throw new Error('Isi jurnal tidak boleh kosong. 🍃')
        }
        if (content.length > 5000) {
            throw new Error('Isi jurnal maksimal 5000 karakter. 🍃')
        }
        if (title && title.length > 100) {
            throw new Error('Judul jurnal maksimal 100 karakter. 🍃')
        }

        const today = getLocalDateString()

        // Guest Mode
        if (authStore.isGuest) {
            const nowIso = new Date().toISOString()
            if (id) {
                // Editing existing
                const index = journals.value.findIndex(j => j.id === id)
                if (index !== -1) {
                    const updatedEntry: JournalEntry = {
                        ...journals.value[index],
                        title,
                        content,
                        mood_tag: moodTag,
                        updated_at: nowIso
                    }
                    journals.value[index] = updatedEntry
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('rt_guest_journals', JSON.stringify(journals.value))
                    }
                    return updatedEntry
                } else {
                    throw new Error('Jurnal tidak ditemukan untuk diperbarui.')
                }
            } else {
                // Creating new
                const newEntry: JournalEntry = {
                    id: crypto.randomUUID(),
                    user_id: 'guest-user',
                    title,
                    content,
                    mood_tag: moodTag,
                    date: today,
                    created_at: nowIso,
                    updated_at: nowIso
                }
                journals.value.unshift(newEntry)
                if (typeof window !== 'undefined') {
                    localStorage.setItem('rt_guest_journals', JSON.stringify(journals.value))
                }
                return newEntry
            }
        }

        // Authenticated Mode
        const userId = await authStore.getUserId()
        if (!userId) throw new Error('Sesi pengguna tidak ditemukan. Silakan masuk kembali.')

        if (id) {
            // Update
            const { data, error } = await client
                .from('journal_entries')
                .update({
                    title,
                    content,
                    mood_tag: moodTag,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .eq('user_id', userId)
                .select()
                .single()

            if (error) throw error

            const index = journals.value.findIndex(j => j.id === id)
            if (index !== -1) {
                journals.value[index] = data as JournalEntry
            }
            return data
        } else {
            // Create
            const { data, error } = await client
                .from('journal_entries')
                .insert({
                    user_id: userId,
                    title,
                    content,
                    mood_tag: moodTag,
                    date: today
                })
                .select()
                .single()

            if (error) throw error

            journals.value.unshift(data as JournalEntry)
            return data
        }
    }

    // Delete journal
    const deleteJournal = async (id: string) => {
        try {
            if (authStore.isGuest) {
                journals.value = journals.value.filter(j => j.id !== id)
                if (typeof window !== 'undefined') {
                    localStorage.setItem('rt_guest_journals', JSON.stringify(journals.value))
                }
                return
            }

            const userId = await authStore.getUserId()
            if (!userId) throw new Error('Sesi tidak ditemukan.')

            const { error } = await client
                .from('journal_entries')
                .delete()
                .eq('id', id)
                .eq('user_id', userId)

            if (error) throw error
            journals.value = journals.value.filter(j => j.id !== id)
        } catch (e) {
            console.error('Failed to delete journal:', e)
            throw e
        }
    }

    return {
        journals,
        loading,
        fetchJournals,
        submitJournal,
        deleteJournal
    }
})
