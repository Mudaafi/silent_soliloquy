import type { HandlerEvent, HandlerResponse } from '@netlify/functions'
import { hasWebhookSecret } from './lib/request'
import type { TeleUpdate } from './lib/telegram'
import {
  processTeleCallback,
  processTeleError,
  processTeleMsg,
} from './lib/telegram-extension'

export async function handler(event: HandlerEvent): Promise<HandlerResponse> {
  if (!hasWebhookSecret(event)) return { statusCode: 401, body: 'Unauthorized' }

  if (event.httpMethod == 'POST') {
    const prompt = JSON.parse(event.body ?? 'null')
    await processTelePrompt(prompt)
  }
  return {
    statusCode: 200,
    body: 'done',
  }
}

async function processTelePrompt(prompt: TeleUpdate) {
  try {
    if (prompt.message) await processTeleMsg(prompt.message)
    else if (prompt.callback_query)
      await processTeleCallback(prompt.callback_query)
  } catch (e) {
    await processTeleError(prompt, e as Error)
    console.log(e)
  }
}
