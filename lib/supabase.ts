import { createClient } from "@supabase/supabase-js";
import { secureStorage } from "./utils/secureStorage";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: secureStorage,
    storageKey: "triage.supabase.auth",
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
