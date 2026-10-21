import type { TeleCallbackQuery } from './telegram'
import { callbackStartVerify } from './flows/start-flow'
import {
  isProposalButton,
  runProposalCallback,
} from './flows/wiki-proposals-flow'

export async function runCallbackFlow(callback: TeleCallbackQuery) {
  if (isProposalButton(callback.data)) return runProposalCallback(callback)
  // Every other button is "Log Me In!", whose callback data is the seshId
  const seshId = callback.data
  if (!seshId) return
  return callbackStartVerify(callback.from.id, seshId)
}
