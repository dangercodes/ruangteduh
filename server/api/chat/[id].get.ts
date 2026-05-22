// serverSupabaseClient and serverSupabaseUser are auto-imported by `@nuxtjs/supabase`
export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const sessionId = getRouterParam(event, 'id')
  if (!sessionId) {
    throw createError({ statusCode: 400, statusMessage: 'Session ID required' })
  }

  const client = await serverSupabaseClient(event)

  // Verify session belongs to user
  const { data: session, error: sessionError } = await client
    .from('chat_sessions')
    .select('id')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single()

  if (sessionError || !session) {
    throw createError({ statusCode: 404, statusMessage: 'Session not found' })
  }

  const { data, error } = await client
    .from('chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return data
})
