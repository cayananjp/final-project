import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dwtywmfxpisnoazlrmas.supabase.co'
const supabaseAnonKey = 'sb_publishable_l_rQb7urpuIjrmpuxQIEww_4G8ty26s'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)