export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) {
    return;
  }

  // Let Supabase handle hash fragments (tokens) on the client side
  if (to.hash?.includes('access_token') || to.query?.code) {
    return;
  }

  const { getSession } = useAuth();
  const session = await getSession();

  if (!session) {
    if (to.path !== '/auth/login' && to.path !== '/') {
      return navigateTo('/auth/login');
    }
    return;
  }

  if (to.path === '/auth/login') {
    return navigateTo('/dashboard');
  }

  // Pre-load essential user settings if they are not already loaded
  const { loadCurrency } = useCurrency();
  loadCurrency(); // Run in background to not block navigation
});
