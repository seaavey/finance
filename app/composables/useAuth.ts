import type { User } from '@supabase/supabase-js'
import { useSupabase } from '~/lib/supabase'

export const useAuth = () => {
  const supabase = useSupabase()
  const user = useState<User | null>('user', () => null)
  const loading = useState('auth-loading', () => true)

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (error) throw error
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    user.value = null
    await navigateTo('/login')
  }

  const getSession = async () => {
    loading.value = true
    const { data: { session } } = await supabase.auth.getSession()
    user.value = session?.user ?? null
    loading.value = false
    return session
  }

  return { user, loading, signInWithGoogle, signOut, getSession }
}
