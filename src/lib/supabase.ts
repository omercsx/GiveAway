import {createClient} from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';

const supabaseUrl = 'https://mtqdhqlmdndvvhjmphll.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10cWRocWxtZG5kdnZoam1waGxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgzNzQ3OTMsImV4cCI6MjA1Mzk1MDc5M30.npIzYiRuUpfg_4b6DiGcVccQ0hJkCZFwiWP-PKcE1dk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
