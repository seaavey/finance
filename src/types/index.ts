export type { Database, Json } from './database'
export type { Result } from './result'
export { AppError } from './result'

/** Non-recursive JSON type for Vue reactivity compatibility */
export type SafeJson =
  | string
  | number
  | boolean
  | null
  | { [key: string]: string | number | boolean | null | undefined }
  | Array<string | number | boolean | null>
