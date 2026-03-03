import { listTrips } from '#server/utils/driftMap'

export default defineEventHandler(async (event) => {
  return await listTrips(event)
})
