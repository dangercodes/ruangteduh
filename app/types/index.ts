// RuangTeduh Type Definitions

export interface Profile {
  id: string
  username: string
  avatar_emoji: string
  created_at: string
  updated_at: string
}

export type MoodType = 'sangat_baik' | 'baik' | 'biasa' | 'sedih' | 'sangat_sedih' | 'cemas' | 'marah' | 'lelah'

export interface MoodEntry {
  id: string
  user_id: string
  mood: MoodType
  note: string | null
  date: string
  created_at: string
}

export interface MoodOption {
  value: MoodType
  emoji: string
  label: string
  color: string
}

export interface ChatSession {
  id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: string
  session_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface CommunityPost {
  id: string
  user_id: string
  content: string
  anonymous_name: string
  support_count: number
  hug_count: number
  created_at: string
  updated_at: string
  profiles?: Pick<Profile, 'avatar_emoji'>
  comment_count?: number
  user_reaction?: PostReaction | null
}

export interface CommunityComment {
  id: string
  post_id: string
  user_id: string
  content: string
  anonymous_name: string
  created_at: string
  profiles?: Pick<Profile, 'avatar_emoji'>
}

export type ReactionType = 'support' | 'hug'

export interface PostReaction {
  id: string
  post_id: string
  user_id: string
  type: ReactionType
  created_at: string
}

export interface SafetyCheckResult {
  isCrisis: boolean
  message?: string
  hotline?: string
}

export interface WeeklyStats {
  moodEntries: number
  chatSessions: number
  communityPosts: number
}

export interface JournalEntry {
  id: string
  user_id: string
  title: string | null
  content: string
  mood_tag: MoodType | null
  date: string
  created_at: string
  updated_at: string
}

