import { updateStop } from '#server/utils/driftMap'

export default defineEventHandler(async (event) => {
  const tripId = getRouterParam(event, 'id')
  const dayId = getRouterParam(event, 'dayId')
  const stopId = getRouterParam(event, 'stopId')

  if (!tripId || !dayId || !stopId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Trip id, day id, and stop id are required.',
    })
  }

  return await updateStop(event, tripId, dayId, stopId)
})
