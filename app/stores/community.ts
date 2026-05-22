import { defineStore } from 'pinia'
import type { CommunityPost, CommunityComment, ReactionType } from '~/types'
export const useCommunityStore = defineStore('community', () => {
    const client = useSupabaseClient()
    const authStore = useAuthStore()
    const posts = ref<CommunityPost[]>([])
    const loading = ref(true)
    const fetchPosts = async (limit = 20) => {
        loading.value = true
        try {
            if (authStore.isGuest) {
                const { data, error } = await client
                    .from('community_posts')
                    .select(`
              *,
              profiles (avatar_emoji),
              comment_count:community_comments(count)
            `)
                    .order('created_at', { ascending: false })
                    .limit(limit)
                if (error) throw error
                posts.value = (data || []).map((p: any) => ({
                    ...p,
                    comment_count: p.comment_count?.[0]?.count || 0,
                    user_reaction: null,
                })) as CommunityPost[]
                return
            }
            const userId = await authStore.getUserId()
            if (!userId) return
            const { data, error } = await client
                .from('community_posts')
                .select(`
          *,
          profiles (avatar_emoji),
          comment_count:community_comments(count)
        `)
                .order('created_at', { ascending: false })
                .limit(limit)
            if (error) throw error
            // Fetch user reactions
            const postIds = (data || []).map((p: any) => p.id)
            const { data: reactions } = await client
                .from('post_reactions')
                .select('*')
                .eq('user_id', userId)
                .in('post_id', postIds)
            const reactionMap = new Map(
                (reactions || []).map((r: any) => [r.post_id, r])
            )
            posts.value = (data || []).map((p: any) => ({
                ...p,
                comment_count: p.comment_count?.[0]?.count || 0,
                user_reaction: reactionMap.get(p.id) || null,
            })) as CommunityPost[]
        } catch (e) {
            console.error('Failed to fetch posts:', e)
        } finally {
            loading.value = false
        }
    }
    const createPost = async (rawContent: string) => {
        // Validate and sanitize
        const validatedContent = validateLength(rawContent, 5, 2000, 'Cerita')
        const content = sanitizeClientInput(validatedContent)

        // Rate Limit: 1 post per 60 seconds
        checkClientRateLimit('community_post', 60000)

        if (authStore.isGuest) {
            throw new Error('Aksi ini memerlukan akun. Silakan buat akun terlebih dahulu untuk berbagi cerita. 🍃')
        }
        const userId = await authStore.getUserId()
        if (!userId) return
        // Fetch user profile for anonymous name
        const { data: profile } = await client
            .from('profiles')
            .select('username, avatar_emoji')
            .eq('id', userId)
            .single()
        const { data, error } = await client
            .from('community_posts')
            .insert({
                user_id: userId,
                content,
                anonymous_name: profile?.username || 'Anonim',
            })
            .select(`*, profiles (avatar_emoji)`)
            .single()
        if (error) throw error
        posts.value.unshift({
            ...data,
            hug_count: 0,
            comment_count: 0,
            user_reaction: null,
        } as CommunityPost)
        return data
    }
    const reactToPost = async (postId: string, type: ReactionType) => {
        if (authStore.isGuest) {
            throw new Error('Aksi ini memerlukan akun. Silakan buat akun terlebih dahulu untuk memberikan dukungan. 🍃')
        }
        const userId = await authStore.getUserId()
        if (!userId) return
        const post = posts.value.find((p) => p.id === postId)
        if (!post) return
        // Toggle reaction
        if (post.user_reaction?.type === type) {
            // Remove reaction
            await client
                .from('post_reactions')
                .delete()
                .eq('post_id', postId)
                .eq('user_id', userId)
            post.user_reaction = null
            if (type === 'support') post.support_count = Math.max(0, post.support_count - 1)
            if (type === 'hug') post.hug_count = Math.max(0, (post.hug_count || 0) - 1)
        } else {
            // Upsert reaction
            await client
                .from('post_reactions')
                .upsert(
                    {
                        post_id: postId,
                        user_id: userId,
                        type,
                    },
                    { onConflict: 'post_id,user_id' }
                )
            // Handle transitions and increments
            const oldType = post.user_reaction?.type
            if (oldType === 'support' && type === 'hug') {
                post.support_count = Math.max(0, post.support_count - 1)
                post.hug_count = (post.hug_count || 0) + 1
            } else if (oldType === 'hug' && type === 'support') {
                post.hug_count = Math.max(0, (post.hug_count || 0) - 1)
                post.support_count = (post.support_count || 0) + 1
            } else {
                // Fresh reactions
                if (type === 'support') {
                    post.support_count = (post.support_count || 0) + 1
                } else if (type === 'hug') {
                    post.hug_count = (post.hug_count || 0) + 1
                }
            }
            post.user_reaction = { id: '', post_id: postId, user_id: userId, type, created_at: new Date().toISOString() }
        }
    }
    const fetchComments = async (postId: string) => {
        const { data, error } = await client
            .from('community_comments')
            .select(`*, profiles (avatar_emoji)`)
            .eq('post_id', postId)
            .order('created_at', { ascending: true })
        if (error) throw error
        return (data || []) as CommunityComment[]
    }
    const addComment = async (postId: string, rawContent: string) => {
        // Validate and sanitize
        const validatedContent = validateLength(rawContent, 2, 1000, 'Komentar')
        const content = sanitizeClientInput(validatedContent)

        // Rate Limit: 1 comment per 30 seconds
        checkClientRateLimit('community_comment', 30000)

        if (authStore.isGuest) {
            throw new Error('Aksi ini memerlukan akun. Silakan buat akun terlebih dahulu untuk berkomentar. 🍃')
        }
        const userId = await authStore.getUserId()
        if (!userId) return
        const { data: profile } = await client
            .from('profiles')
            .select('username, avatar_emoji')
            .eq('id', userId)
            .single()
        const { data, error } = await client
            .from('community_comments')
            .insert({
                post_id: postId,
                user_id: userId,
                content,
                anonymous_name: profile?.username || 'Anonim',
            })
            .select(`*, profiles (avatar_emoji)`)
            .single()
        if (error) throw error
        // Update comment count in posts list
        const post = posts.value.find((p) => p.id === postId)
        if (post) post.comment_count = (post.comment_count || 0) + 1
        return data as CommunityComment
    }
    // Realtime subscription
    const subscribeToNewPosts = () => {
        const channel = client
            .channel('community-posts')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'community_posts',
                },
                async (payload) => {
                    const userId = await authStore.getUserId()
                    if (payload.new && userId && payload.new.user_id !== userId) {
                        const { data } = await client
                            .from('community_posts')
                            .select(`*, profiles (avatar_emoji)`)
                            .eq('id', payload.new.id)
                            .single()
                        if (data) {
                            posts.value.unshift({
                                ...data,
                                hug_count: data.hug_count || 0,
                                comment_count: 0,
                                user_reaction: null,
                            } as CommunityPost)
                        }
                    }
                }
            )
            .subscribe()
        // Cleanup on unmount
        onUnmounted(() => {
            client.removeChannel(channel)
        })
    }
    return {
        posts,
        loading,
        fetchPosts,
        createPost,
        reactToPost,
        fetchComments,
        addComment,
        subscribeToNewPosts,
    }
})
