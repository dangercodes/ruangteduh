import { defineStore } from 'pinia'
import type { ChatSession, ChatMessage } from '~/types'

// ============================================
// Cryptographic Helpers for Chat Encryption (AES-GCM)
// ============================================

const getEncryptionKey = async (userId: string): Promise<CryptoKey | null> => {
    const cryptoObj = typeof window !== 'undefined' ? window.crypto : (typeof globalThis !== 'undefined' ? globalThis.crypto : null)
    if (!cryptoObj || !cryptoObj.subtle) return null

    const salt = 'RuangTeduhSecureSecretPepper'
    const encoder = new TextEncoder()
    const keyMaterial = encoder.encode(userId + salt)
    const hash = await cryptoObj.subtle.digest('SHA-256', keyMaterial)
    
    return await cryptoObj.subtle.importKey(
        'raw',
        hash,
        { name: 'AES-GCM' },
        false,
        ['encrypt', 'decrypt']
    )
}

const encryptText = async (text: string, userId: string): Promise<string> => {
    if (userId === 'guest-user') return text
    if (!text) return text
    try {
        const cryptoObj = typeof window !== 'undefined' ? window.crypto : (typeof globalThis !== 'undefined' ? globalThis.crypto : null)
        const key = await getEncryptionKey(userId)
        if (!key || !cryptoObj) return text

        const encoder = new TextEncoder()
        const data = encoder.encode(text)
        const iv = cryptoObj.getRandomValues(new Uint8Array(12))
        
        const encryptedBuffer = await cryptoObj.subtle.encrypt(
            { name: 'AES-GCM', iv },
            key,
            data
        )
        
        const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength)
        combined.set(iv, 0)
        combined.set(new Uint8Array(encryptedBuffer), iv.length)
        
        if (typeof btoa !== 'undefined') {
            return btoa(String.fromCharCode(...combined))
        } else {
            return Buffer.from(combined).toString('base64')
        }
    } catch (e) {
        console.error('Encryption failed:', e)
        return text
    }
}

const decryptText = async (encryptedBase64: string, userId: string): Promise<string> => {
    if (userId === 'guest-user') return encryptedBase64
    if (!encryptedBase64) return encryptedBase64
    try {
        const cryptoObj = typeof window !== 'undefined' ? window.crypto : (typeof globalThis !== 'undefined' ? globalThis.crypto : null)
        const key = await getEncryptionKey(userId)
        if (!key || !cryptoObj) return encryptedBase64

        let bytes: Uint8Array
        if (typeof atob !== 'undefined') {
            const binaryString = atob(encryptedBase64)
            const len = binaryString.length
            bytes = new Uint8Array(len)
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i)
            }
        } else {
            bytes = new Uint8Array(Buffer.from(encryptedBase64, 'base64'))
        }
        
        const iv = bytes.slice(0, 12)
        const ciphertext = bytes.slice(12)
        
        const decryptedBuffer = await cryptoObj.subtle.decrypt(
            { name: 'AES-GCM', iv },
            key,
            ciphertext
        )
        
        const decoder = new TextDecoder()
        return decoder.decode(decryptedBuffer)
    } catch (e) {
        return encryptedBase64
    }
}

export const useChatStore = defineStore('chat', () => {
    const client = useSupabaseClient()
    const authStore = useAuthStore()
    const sessions = ref<ChatSession[]>([])
    const messages = ref<ChatMessage[]>([])
    const currentSession = ref<ChatSession | null>(null)
    const loading = ref(true)
    const sending = ref(false)
    const typing = ref(false)
    const fetchSessions = async () => {
        loading.value = true
        try {
            if (authStore.isGuest) {
                if (typeof window !== 'undefined') {
                    const sessionsRaw = localStorage.getItem('rt_guest_chat_sessions')
                    if (sessionsRaw) {
                        try {
                            sessions.value = JSON.parse(sessionsRaw) as ChatSession[]
                        } catch (e) {
                            console.error(e)
                            sessions.value = []
                        }
                    } else {
                        sessions.value = []
                    }
                }
                return
            }
            const userId = await authStore.getUserId()
            if (!userId) return
            const { data, error } = await client
                .from('chat_sessions')
                .select('*')
                .eq('user_id', userId)
                .order('updated_at', { ascending: false })
            if (error) throw error

            // Decrypt session titles
            const decryptedSessions: ChatSession[] = []
            if (data) {
                for (const s of data) {
                    decryptedSessions.push({
                        ...s,
                        title: await decryptText(s.title || '', userId)
                    } as ChatSession)
                }
            }
            sessions.value = decryptedSessions
        } catch (e) {
            console.error('Failed to fetch sessions:', e)
        } finally {
            loading.value = false
        }
    }
    const createSession = async (rawTitle?: string) => {
        const title = rawTitle ? sanitizeClientInput(rawTitle) : undefined
        if (authStore.isGuest) {
            const plainTitle = title || 'Percakapan Baru'
            const session: ChatSession = {
                id: crypto.randomUUID(),
                user_id: 'guest-user',
                title: plainTitle,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
            sessions.value.unshift(session)
            if (typeof window !== 'undefined') {
                localStorage.setItem('rt_guest_chat_sessions', JSON.stringify(sessions.value))
            }
            currentSession.value = session
            messages.value = []
            return session
        }
        const userId = await authStore.getUserId()
        if (!userId) return null
        const plainTitle = title || 'Percakapan Baru'
        const encryptedTitle = await encryptText(plainTitle, userId)
        const { data, error } = await client
            .from('chat_sessions')
            .insert({
                user_id: userId,
                title: encryptedTitle,
            })
            .select()
            .single()
        if (error) throw error
        const session = {
            ...(data as ChatSession),
            title: plainTitle
        }
        sessions.value.unshift(session)
        currentSession.value = session
        messages.value = []
        return session
    }
    const fetchMessages = async (sessionId: string) => {
        loading.value = true
        try {
            if (authStore.isGuest) {
                if (typeof window !== 'undefined') {
                    const messagesRaw = localStorage.getItem('rt_guest_chat_messages')
                    if (messagesRaw) {
                        try {
                            const allMessages = JSON.parse(messagesRaw) as ChatMessage[]
                            messages.value = allMessages.filter(m => m.session_id === sessionId)
                        } catch (e) {
                            console.error(e)
                            messages.value = []
                        }
                    } else {
                        messages.value = []
                    }
                }
                return
            }
            const userId = await authStore.getUserId()
            const { data, error } = await client
                .from('chat_messages')
                .select('*')
                .eq('session_id', sessionId)
                .order('created_at', { ascending: true })
            if (error) throw error

            const decryptedMessages: ChatMessage[] = []
            if (userId && data) {
                for (const m of data) {
                    decryptedMessages.push({
                        ...m,
                        content: await decryptText(m.content, userId)
                    } as ChatMessage)
                }
            } else {
                decryptedMessages.push(...((data || []) as ChatMessage[]))
            }
            messages.value = decryptedMessages
        } catch (e) {
            console.error('Failed to fetch messages:', e)
        } finally {
            loading.value = false
        }
    }
    const sendMessage = async (rawContent: string, sessionId: string) => {
        const validatedContent = validateLength(rawContent, 1, 2000, 'Pesan')
        const content = sanitizeClientInput(validatedContent)
        if (authStore.isGuest) {
            sending.value = true
            // Add user message to local state immediately
            const userMessage: ChatMessage = {
                id: crypto.randomUUID(),
                session_id: sessionId,
                role: 'user',
                content,
                created_at: new Date().toISOString(),
            }
            messages.value.push(userMessage)
            // Save user message to localStorage
            if (typeof window !== 'undefined') {
                const messagesRaw = localStorage.getItem('rt_guest_chat_messages')
                let allMessages: ChatMessage[] = []
                if (messagesRaw) {
                    try {
                        allMessages = JSON.parse(messagesRaw)
                    } catch (e) {
                        console.error(e)
                    }
                }
                allMessages.push(userMessage)
                localStorage.setItem('rt_guest_chat_messages', JSON.stringify(allMessages))
            }
            // Show typing indicator
            typing.value = true
            try {
                // Call server API for AI response
                const { data } = await useFetch('/api/chat/send', {
                    method: 'POST',
                    body: {
                        message: content,
                        history: messages.value.slice(-20).map((m) => ({
                            role: m.role,
                            content: m.content,
                        })),
                    },
                })
                typing.value = false
                const aiContent = (data.value as any)?.reply || 'Maaf, saya tidak bisa merespons saat ini. Silakan coba lagi.'
                // Add AI message to local state
                const aiMessage: ChatMessage = {
                    id: crypto.randomUUID(),
                    session_id: sessionId,
                    role: 'assistant',
                    content: aiContent,
                    created_at: new Date().toISOString(),
                }
                messages.value.push(aiMessage)
                // Save AI message to localStorage
                if (typeof window !== 'undefined') {
                    const messagesRaw = localStorage.getItem('rt_guest_chat_messages')
                    let allMessages: ChatMessage[] = []
                    if (messagesRaw) {
                        try {
                            allMessages = JSON.parse(messagesRaw)
                        } catch (e) {
                            console.error(e)
                        }
                    }
                    allMessages.push(aiMessage)
                    localStorage.setItem('rt_guest_chat_messages', JSON.stringify(allMessages))
                }
                // Update session title from first user message
                if (messages.value.filter((m) => m.role === 'user').length === 1) {
                    const title = content.substring(0, 50) + (content.length > 50 ? '...' : '')
                    
                    // Update local session title
                    const localSession = sessions.value.find(s => s.id === sessionId)
                    if (localSession) {
                        localSession.title = title
                        localSession.updated_at = new Date().toISOString()
                    }
                    if (currentSession.value && currentSession.value.id === sessionId) {
                        currentSession.value.title = title
                        currentSession.value.updated_at = new Date().toISOString()
                    }
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('rt_guest_chat_sessions', JSON.stringify(sessions.value))
                    }
                }
            } catch (e) {
                typing.value = false
                console.error('Failed to send message:', e)
                // Add error message
                const errMessage: ChatMessage = {
                    id: crypto.randomUUID(),
                    session_id: sessionId,
                    role: 'assistant',
                    content: 'Maaf, terjadi kesalahan. Silakan coba lagi. 🙏',
                    created_at: new Date().toISOString(),
                }
                messages.value.push(errMessage)
                if (typeof window !== 'undefined') {
                    const messagesRaw = localStorage.getItem('rt_guest_chat_messages')
                    let allMessages: ChatMessage[] = []
                    if (messagesRaw) {
                        try {
                            allMessages = JSON.parse(messagesRaw)
                        } catch (e) {
                            console.error(e)
                        }
                    }
                    allMessages.push(errMessage)
                    localStorage.setItem('rt_guest_chat_messages', JSON.stringify(allMessages))
                }
            } finally {
                sending.value = false
            }
            return
        }
        const userId = await authStore.getUserId()
        if (!userId) return
        sending.value = true
        // Add user message to local state immediately
        const userMessage: ChatMessage = {
            id: crypto.randomUUID(),
            session_id: sessionId,
            role: 'user',
            content,
            created_at: new Date().toISOString(),
        }
        messages.value.push(userMessage)
        // Save user message to DB (encrypted)
        const encryptedUserContent = await encryptText(content, userId)
        await client.from('chat_messages').insert({
            session_id: sessionId,
            role: 'user',
            content: encryptedUserContent,
        })
        // Show typing indicator
        typing.value = true
        try {
            // Call server API for AI response
            const { data } = await useFetch('/api/chat/send', {
                method: 'POST',
                body: {
                    message: content,
                    history: messages.value.slice(-20).map((m) => ({
                        role: m.role,
                        content: m.content,
                    })),
                },
            })
            typing.value = false
            const aiContent = (data.value as any)?.reply || 'Maaf, saya tidak bisa merespons saat ini. Silakan coba lagi.'
            // Add AI message to local state
            const aiMessage: ChatMessage = {
                id: crypto.randomUUID(),
                session_id: sessionId,
                role: 'assistant',
                content: aiContent,
                created_at: new Date().toISOString(),
            }
            messages.value.push(aiMessage)
            // Save AI message to DB (encrypted)
            const encryptedAiContent = await encryptText(aiContent, userId)
            await client.from('chat_messages').insert({
                session_id: sessionId,
                role: 'assistant',
                content: encryptedAiContent,
            })
            // Update session title from first user message (encrypted)
            if (messages.value.filter((m) => m.role === 'user').length === 1) {
                const title = content.substring(0, 50) + (content.length > 50 ? '...' : '')
                const encryptedTitle = await encryptText(title, userId)
                
                // Update local session title
                const localSession = sessions.value.find(s => s.id === sessionId)
                if (localSession) {
                    localSession.title = title
                }
                if (currentSession.value && currentSession.value.id === sessionId) {
                    currentSession.value.title = title
                }

                await client
                    .from('chat_sessions')
                    .update({ title: encryptedTitle, updated_at: new Date().toISOString() })
                    .eq('id', sessionId)
            }
        } catch (e) {
            typing.value = false
            console.error('Failed to send message:', e)
            // Add error message
            messages.value.push({
                id: crypto.randomUUID(),
                session_id: sessionId,
                role: 'assistant',
                content: 'Maaf, terjadi kesalahan. Silakan coba lagi. 🙏',
                created_at: new Date().toISOString(),
            })
        } finally {
            sending.value = false
        }
    }
    const deleteSession = async (sessionId: string) => {
        if (authStore.isGuest) {
            // Update local state
            sessions.value = sessions.value.filter(s => s.id !== sessionId)
            if (currentSession.value?.id === sessionId) {
                currentSession.value = null
                messages.value = []
            }
            if (typeof window !== 'undefined') {
                localStorage.setItem('rt_guest_chat_sessions', JSON.stringify(sessions.value))
                const messagesRaw = localStorage.getItem('rt_guest_chat_messages')
                if (messagesRaw) {
                    try {
                        const allMessages = JSON.parse(messagesRaw) as ChatMessage[]
                        const filtered = allMessages.filter(m => m.session_id !== sessionId)
                        localStorage.setItem('rt_guest_chat_messages', JSON.stringify(filtered))
                    } catch (e) {
                        console.error(e)
                    }
                }
            }
            return
        }
        try {
            // Delete messages first to prevent foreign key constraint violations
            await client
                .from('chat_messages')
                .delete()
                .eq('session_id', sessionId)

            // Delete session
            const { error } = await client
                .from('chat_sessions')
                .delete()
                .eq('id', sessionId)
            
            if (error) throw error

            // Update local state
            sessions.value = sessions.value.filter(s => s.id !== sessionId)
            if (currentSession.value?.id === sessionId) {
                currentSession.value = null
                messages.value = []
            }
        } catch (e) {
            console.error('Failed to delete chat session:', e)
            throw e
        }
    }
    return {
        sessions,
        messages,
        currentSession,
        loading,
        sending,
        typing,
        fetchSessions,
        createSession,
        fetchMessages,
        sendMessage,
        deleteSession,
    }
})