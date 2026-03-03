import { createTrip } from '#server/utils/driftMap'

export default defineEventHandler(async (event) => {
  return await createTrip(event)
})
