import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getOgImageUrl(title: string, description: string) {
  const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
  const baseUrl = `${supabaseUrl}/functions/v1/og-image`;
  const params = new URLSearchParams({
    title,
    desc: description,
  });
  return `${baseUrl}?${params.toString()}`;
}

