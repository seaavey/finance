import { useSupabase } from '~/lib/supabase';

export default defineNuxtPlugin(async () => {
  if (import.meta.server) return;

  const supabase = useSupabase();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const user = useState('user', () => session?.user ?? null);

  supabase.auth.onAuthStateChange((_event, session) => {
    user.value = session?.user ?? null;
    if (session) {
      const path = window.location.pathname;
      if (path === '/' || path === '/login') {
        navigateTo('/dashboard');
      }
    }
  });
});
