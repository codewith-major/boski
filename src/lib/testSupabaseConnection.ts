import { supabase } from './supabase';

export async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');
  try {
    // A simple query to a known public table to verify connection
    // Limiting to 1 to minimize data transfer
    const { data, error } = await supabase.from('schools').select('id').limit(1);

    if (error) {
      console.error('Supabase connection test failed. Error details:', error);
      return { success: false, error };
    }

    console.log('Supabase connection test successful! Live data accessed:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Supabase connection test threw an exception:', error);
    return { success: false, error };
  }
}
