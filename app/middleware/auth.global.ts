export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === '/login') return
  if (to.hash?.includes('access_token')) return

  const { getSession } = useAuth()
  const session = await getSession()

  if (!session) {
    return navigateTo('/login')
  }
})
