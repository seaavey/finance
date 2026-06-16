import type { QueryClient } from '@tanstack/vue-query'
import type { ActionType, Result } from '@/types'

export type EntityType =
  | 'account'
  | 'bill'
  | 'budget'
  | 'category'
  | 'goal'
  | 'recurring'
  | 'subscription'
  | 'transaction'
  | 'partner'

interface MutationFeedbackOptions<T = unknown> {
  entity: EntityType
  action: ActionType
  queryClient: QueryClient
  queryKeys: string[][]
  successKey: string
  errorKey: string
  meta?: Record<string, unknown>
  entityId?: string
  /** If true, toast + activity log are skipped (silent mutation) */
  silent?: boolean
}

/**
 * Handles the common mutation feedback pattern:
 * result check → invalidate → toast → activity log
 *
 * Returns the raw result so callers can read .data or .error.
 */
export function useMutationFeedback() {
  const { t } = useI18n()
  const { toast } = useToast()
  const activity = useActivityLog()

  async function mutate<T>(
    fn: () => Promise<Result<T>>,
    opts: MutationFeedbackOptions<T>,
  ): Promise<Result<T>> {
    const result = await fn()

    if (!result.error) {
      for (const key of opts.queryKeys) {
        opts.queryClient.invalidateQueries({ queryKey: key })
      }
      if (!opts.silent) {
        toast.success(t(opts.successKey))
        activity.log(opts.entity, opts.action, opts.meta ?? {}, opts.entityId)
      }
    } else if (!opts.silent) {
      toast.error(t(opts.errorKey))
    }

    return result
  }

  return { mutate }
}
