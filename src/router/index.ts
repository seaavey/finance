import { createRouter, createWebHistory } from 'vue-router'
import routes from 'virtual:generated-pages'
import { useAuth } from '@/composables/useAuth'

// Define which paths should use the 'blank' layout
const blankLayoutRoutes = [
  '/',
  '/login',
  '/about',
  '/contact',
  '/privacy-policy',
  '/terms-of-service',
  '/auth/login'
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes.map((route) => {
    // Check if this route should be blank
    const isBlank = blankLayoutRoutes.includes(route.path) || 
                   (route.name && blankLayoutRoutes.includes(`/${String(route.name)}`));
    
    return {
      ...route,
      meta: {
        ...route.meta,
        layout: isBlank ? 'blank' : 'default',
      },
    }
  }),
})

// Global Auth Middleware
router.beforeEach(async (to) => {
  // Let Supabase handle hash fragments (tokens) on the client side
  if (to.hash?.includes('access_token') || to.query?.code) {
    return true;
  }

  const { getSession } = useAuth();
  const session = await getSession();

  if (!session) {
    // Redirect to login if not authenticated, except for public pages
    if (to.path !== '/auth/login' && to.path !== '/login' && to.path !== '/') {
      return '/auth/login';
    }
    return true;
  }

  // Redirect to dashboard if already authenticated and trying to access login/landing
  if (to.path === '/auth/login' || to.path === '/login') {
    return '/dashboard';
  }

  return true;
});

export default router
