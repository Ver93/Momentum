import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fsjxmnggieaulqnmmxtv.supabase.co'
const supabaseAnonKey = 'sb_publishable_EpkZTCFCPPdqj25DJ4WcKA_t8D9CG-l'

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
)