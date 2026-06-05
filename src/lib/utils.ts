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

export function getOgImageUrl(title: string, description: string) {
  const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL
  const baseUrl = `${supabaseUrl}/functions/v1/og-image`
  const params = new URLSearchParams({
    title,
    desc: description,
  })
  return `${baseUrl}?${params.toString()}`
}
