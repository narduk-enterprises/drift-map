import { getTripAsset } from '#server/utils/driftMap'

export default defineEventHandler(async (event) => {
  const key = getRouterParam(event, 'key')

  if (!key) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Asset key is required.',
    })
  }

  return await getTripAsset(event, decodeURIComponent(key))
})
