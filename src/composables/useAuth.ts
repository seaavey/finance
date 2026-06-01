import { ref } from 'vue';
import { useRouter } from 'vue-router';
import type { User } from '@supabase/supabase-js';
import { useSupabase } from '@/lib/supabase';

// State shared across all useAuth calls
export const user = ref<User | null>(null);
export const loading = ref(true);
let loginLogged = false;

export const useAuth = () => {
  const supabase = useSupabase();
  const router = useRouter();

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
    const currentUserId = user.value?.id;
    await supabase.auth.signOut();
    user.value = null;
    loginLogged = false;
    if (currentUserId) {
      supabase.from('activity_logs').insert({
        user_id: currentUserId,
        entity_type: 'auth',
        action: 'logout',
        metadata: {}
      }).then(() => {}).catch(() => {});
    }
    if (router) await router.push('/auth/login');
  };

  const getSession = async () => {
    loading.value = true;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    user.value = session?.user ?? null;
    if (session?.user && !loginLogged) {
      loginLogged = true;
      supabase.from('activity_logs').insert({
        user_id: session.user.id,
        entity_type: 'auth',
        action: 'login',
        metadata: {}
      }).then(() => {}).catch(() => {});
    }
    loading.value = false;
    return session;
  };

  return { user, loading, signInWithGoogle, signOut, getSession };
};
