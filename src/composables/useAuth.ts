import { ref } from 'vue';
import { useRouter } from 'vue-router';
import type { User } from '@supabase/supabase-js';
import { useSupabase } from '@/lib/supabase';

// State shared across all useAuth calls
export const user = ref<User | null>(null);
export const loading = ref(true);

export const useAuth = () => {
  const supabase = useSupabase();
  const router = useRouter();
  const activity = useActivityLog();

  const signInWithGoogle = async () => {
    const redirectTo = `${window.location.origin}/auth/login`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
    if (error) {
      throw error;
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    user.value = null;
    activity.log('auth', 'logout').catch(() => {})
    if (router) await router.push('/auth/login');
  };

  const getSession = async () => {
    loading.value = true;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    user.value = session?.user ?? null;
    if (session?.user) {
      activity.log('auth', 'login').catch(() => {})
    }
    loading.value = false;
    return session;
  };

  return { user, loading, signInWithGoogle, signOut, getSession };
};
