import { useSupabase } from '@/lib/supabase'
import { AppError } from '@/types/result'
import type { Result } from '@/types'

/**
 * Uploads a file to a Supabase storage bucket under the user's directory.
 * Generates a random UUID-based path to avoid collisions.
 *
 * @param userId - ID of the user uploading the file (used as directory prefix)
 * @param file - The File object to upload
 * @param bucket - Supabase storage bucket name
 * @param defaultExt - Fallback file extension if none can be extracted (default: 'jpg')
 * @returns Result containing the public URL of the uploaded file, or an AppError
 */
export async function uploadImage(
  userId: string,
  file: File,
  bucket: string,
  defaultExt = 'jpg',
): Promise<Result<string>> {
  const supabase = useSupabase()
  const ext = file.name.split('.').pop() || defaultExt
  const path = `${userId}/${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage.from(bucket).upload(path, file)
  if (error) return { data: null, error: new AppError(error.message, 'UPLOAD_ERROR', error) }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return { data: data.publicUrl, error: null }
}

/**
 * Deletes a file from a Supabase storage bucket by its public URL.
 * Extracts the storage path from the URL and optionally validates ownership.
 *
 * @param url - Public URL of the file to delete
 * @param bucket - Supabase storage bucket name
 * @param userId - If provided, validates the file path belongs to this user
 * @returns Result containing null on success, or an AppError
 */
export async function deleteImage(
  url: string,
  bucket: string,
  userId?: string,
): Promise<Result<null>> {
  const supabase = useSupabase()
  let path: string
  try {
    const parsed = new URL(url)
    path = parsed.pathname.split('/').slice(-2).join('/')
  } catch {
    return { data: null, error: new AppError('Invalid image URL', 'INVALID_URL') }
  }

  // Validate the extracted path starts with the user's ID to prevent
  // one user from deleting another user's files via a manipulated URL.
  if (userId) {
    const expectedPrefix = `${userId}/`
    if (!path.startsWith(expectedPrefix)) {
      return { data: null, error: new AppError('Unauthorized', 'FORBIDDEN') }
    }
  }

  const { error } = await supabase.storage.from(bucket).remove([path])
  if (error) return { data: null, error: new AppError(error.message, 'DELETE_ERROR', error) }

  return { data: null, error: null }
}
