// MahaSkill Intelligence - Supabase Client Factory
import { createClient } from '@supabase/supabase-js';

const getEnvVar = (name: string): string => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[name]) {
      return import.meta.env[name];
    }
  } catch (e) {
    // Ignore error in Node context
  }
  try {
    if (typeof process !== 'undefined' && process.env && process.env[name]) {
      return process.env[name];
    }
  } catch (e) {
    // Ignore error in browser context
  }
  return '';
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL') || 'https://erfltqteyqmshbituvdv.supabase.co';
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyZmx0cXRleXFtc2hiaXR1dmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5NDAwODYsImV4cCI6MjEwNDUxNjA4Nn0.oYBUjNngl1_tB7AsqQJSD5HqVRghCNFg9UW80uF_Mfw';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-supabase-project.supabase.co'
);

// Public client for frontend (Subject to Supabase Row-Level Security RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false }
});
