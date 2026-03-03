import { uploadTripPhoto } from '#server/utils/driftMap'

export default defineEventHandler(async (event) => {
  return await uploadTripPhoto(event)
})
