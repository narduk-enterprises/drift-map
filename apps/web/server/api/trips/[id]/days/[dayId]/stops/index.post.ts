import { addStop } from '#server/utils/driftMap'

export default defineEventHandler(async (event) => {
  const tripId = getRouterParam(event, 'id')
  const dayId = getRouterParam(event, 'dayId')

  if (!tripId || !dayId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Trip id and day id are required.',
    })
  }

  return await addStop(event, tripId, dayId)
})
