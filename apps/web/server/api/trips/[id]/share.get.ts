import { getSharedTrip } from '#server/utils/driftMap'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'id')

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Share slug is required.',
    })
  }

  return await getSharedTrip(event, slug)
})
