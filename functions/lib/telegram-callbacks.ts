import type { TeleCallbackQuery } from './telegram'
import { callbackStartVerify } from './flows/start-flow'

export async function runCallbackFlow(callback: TeleCallbackQuery) {
  // The only button so far is "Log Me In!", whose callback data is the seshId
  const seshId = callback.data
  if (!seshId) return
  return callbackStartVerify(callback.from.id, seshId)
}
