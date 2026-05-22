// serverSupabaseClient and serverSupabaseUser are auto-imported by `@nuxtjs/supabase`
export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readBody(event)
  const client = await serverSupabaseClient(event)

  const { data, error } = await client
    .from('chat_sessions')
    .insert({
      user_id: user.id,
      title: body?.title || 'Percakapan Baru',
    })
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return data
})
