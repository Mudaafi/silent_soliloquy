import { timingSafeEqual } from 'crypto'
import type { HandlerEvent } from '@netlify/functions'

/**
 * Name of the operation a request is asking for, read from the `function`
 * query parameter. `fn` is accepted as an alias (the original `login` name).
 */
export function getFunctionName(event: HandlerEvent): string | undefined {
  const params = event.queryStringParameters || {}
  return params['function'] || params['fn']
}

/**
 * Whether a request carries the shared secret for admin-only functions, sent
 * as `Authorization: Bearer <MANUAL_EXECS_TOKEN>`. Nothing is authorized while
 * the token is not configured.
 */
export function hasAdminToken(event: HandlerEvent): boolean {
  const expected = process.env.MANUAL_EXECS_TOKEN
  if (!expected) return false
  const header = event.headers['authorization'] || ''
  const given = header.startsWith('Bearer ') ? header.slice(7) : ''
  return safeEqual(given, expected)
}

/**
 * Whether a request really comes from Telegram. Telegram sends the secret the
 * webhook was registered with in `X-Telegram-Bot-Api-Secret-Token` on every
 * update, so an update without it was not sent by Telegram and its `from.id`
 * cannot be trusted. Nothing is accepted while the secret is not configured.
 */
export function hasWebhookSecret(event: HandlerEvent): boolean {
  const expected = process.env.TELE_WEBHOOK_SECRET
  if (!expected) return false
  const given = event.headers['x-telegram-bot-api-secret-token'] || ''
  return safeEqual(given, expected)
}

// Constant-time string comparison
function safeEqual(given: string, expected: string) {
  // Plain Uint8Arrays: newer TypeScript rejects this @types/node's Buffer here
  const a = new Uint8Array(Buffer.from(given))
  const b = new Uint8Array(Buffer.from(expected))
  return a.length == b.length && timingSafeEqual(a, b)
}
