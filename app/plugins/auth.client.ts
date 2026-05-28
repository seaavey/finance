import { useSupabase } from '~/lib/supabase';

export default defineNuxtPlugin(async (_nuxtApp) => {
  const supabase = useSupabase();
  const { getSession, user } = useAuth();

  // Load session immediately on client-side
  const session = await getSession();
  user.value = session?.user ?? null;

  supabase.auth.onAuthStateChange((_event, session) => {
    user.value = session?.user ?? null;
    if (session) {
      const path = window.location.pathname;
      if (path === '/auth/login') {
        navigateTo('/dashboard');
      }
    }
  });
});
