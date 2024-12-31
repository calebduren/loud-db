import { supabase } from '../supabase';

export async function checkUsernameAvailable(username: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .rpc('check_username_available', { username });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error checking username:', error);
    return false;
  }
}