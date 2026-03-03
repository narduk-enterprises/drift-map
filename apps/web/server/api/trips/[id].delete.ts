import { deleteTrip } from '#server/utils/driftMap'

export default defineEventHandler(async (event) => {
  const tripId = getRouterParam(event, 'id')

  if (!tripId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Trip id is required.',
    })
  }

  return await deleteTrip(event, tripId)
})
