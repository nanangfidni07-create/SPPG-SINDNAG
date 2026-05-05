import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('[v0] Missing Supabase environment variables:', {
    url: !!supabaseUrl,
    key: !!supabaseKey
  });
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function signInUser() {
  try {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[v0] Sign in error:', err);
    throw err;
  }
}

export async function getCurrentUser() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session?.user || null;
  } catch (err) {
    console.error('[v0] Get user error:', err);
    return null;
  }
}

export async function addNutritionLog(data) {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: result, error } = await supabase
      .from('nutrition_logs')
      .insert([
        {
          school: data.school,
          menu: data.menu,
          porsi: parseInt(data.porsi, 10),
          user_id: user.id,
          timestamp: new Date().toISOString()
        }
      ])
      .select();

    if (error) throw error;
    return result;
  } catch (err) {
    console.error('[v0] Add nutrition log error:', err);
    throw err;
  }
}

export async function addQualityLog(data) {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: result, error } = await supabase
      .from('quality_logs')
      .insert([
        {
          school: data.school,
          rasa: parseInt(data.rasa, 10),
          suhu: parseInt(data.suhu, 10),
          bersih: parseInt(data.bersih, 10),
          catatan: data.catatan || null,
          user_id: user.id,
          timestamp: new Date().toISOString()
        }
      ])
      .select();

    if (error) throw error;
    return result;
  } catch (err) {
    console.error('[v0] Add quality log error:', err);
    throw err;
  }
}

export async function getNutritionLogs() {
  try {
    const { data, error } = await supabase
      .from('nutrition_logs')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('[v0] Get nutrition logs error:', err);
    return [];
  }
}

export async function getQualityLogs() {
  try {
    const { data, error } = await supabase
      .from('quality_logs')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('[v0] Get quality logs error:', err);
    return [];
  }
}

export function onNutritionLogsChange(callback) {
  const subscription = supabase
    .from('nutrition_logs')
    .on('*', (payload) => {
      callback(payload);
    })
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}

export function onQualityLogsChange(callback) {
  const subscription = supabase
    .from('quality_logs')
    .on('*', (payload) => {
      callback(payload);
    })
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (err) {
    console.error('[v0] Sign out error:', err);
    throw err;
  }
}
