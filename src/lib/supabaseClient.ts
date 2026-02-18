import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl =  import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey)