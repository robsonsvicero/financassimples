import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Hardcoded credentials as fallback for preview environments (AI Studio)
const FALLBACK_URL = "https://ctazwsqmnchckwnmxlzk.supabase.co";
const FALLBACK_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0YXp3c3FtbmNoY2t3bm14bHprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MzQ5NjcsImV4cCI6MjA4MDIxMDk2N30.oEWRMG0vKRtIGBawjCR-hqmiq_kfdMajDhbcD1igX80";

// Safely access environment variables
const getEnv = (key: string) => {
  try {
    const meta = import.meta as any;
    // Check if meta.env exists (Vite environment)
    if (meta && meta.env && meta.env[key]) {
      return meta.env[key];
    }
  } catch (e) {
    // Ignore errors in environments where import.meta is restricted
  }
  return undefined;
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL') || FALLBACK_URL;
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || FALLBACK_KEY;

let supabaseInstance: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error("Failed to initialize Supabase client:", error);
  }
}

export const supabase = supabaseInstance;

export const isSupabaseConfigured = () => {
  return !!supabaseInstance;
};