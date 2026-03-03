import type { H3Event } from 'h3'
import { useDatabase } from '#layer/server/utils/database'

export function useAppDatabase(event: H3Event) {
  return useDatabase(event)
}
