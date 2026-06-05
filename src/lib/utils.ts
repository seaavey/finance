import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format date as YYYY-MM-DD in local time
 */
export function formatDateSafe(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Resolves a route path to a translation key for the page title.
 */
export function getPageTitleKey(path: string): string {
  if (path === '/') return 'common.home'
  if (path.startsWith('/dashboard')) return 'nav.dashboard'
  if (path.startsWith('/transactions')) return 'nav.transactions'
  if (path.startsWith('/categories')) return 'nav.categories'
  if (path.startsWith('/budget')) return 'nav.budget'
  if (path.startsWith('/goals')) return 'nav.goals'
  if (path.startsWith('/bills')) return 'nav.bills'
  if (path.startsWith('/recurring')) return 'nav.recurring'
  if (path.startsWith('/settings')) return 'nav.settings'
  if (path.startsWith('/activities')) return 'nav.activities'
  if (path.startsWith('/accounts')) return 'nav.accounts'
  if (path.startsWith('/schedule')) return 'nav.schedule'
  if (path.startsWith('/auth/login') || path === '/login') return 'auth.login'
  if (path === '/about') return 'common.about'
  if (path === '/contact') return 'common.contact'
  if (path === '/privacy-policy') return 'common.privacy_policy'
  if (path === '/terms-of-service') return 'common.terms_of_service'
  return ''
}

export function getOgImageUrl(title: string, description: string) {
  const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL
  const baseUrl = `${supabaseUrl}/functions/v1/og-image`
  const params = new URLSearchParams({
    title,
    desc: description,
  })
  return `${baseUrl}?${params.toString()}`
}
