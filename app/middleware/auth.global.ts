export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return

  if (to.hash?.includes('access_token')) return

  const { getSession } = useAuth()
  const session = await getSession()

  if (!session) {
    if (to.path === '/login' || to.path === '/') return
    return navigateTo('/login')
  }

  if (to.path === '/login' || to.path === '/') {
    return navigateTo('/dashboard')
  }

  const { loadCurrency } = useCurrency()
  await loadCurrency()
})
