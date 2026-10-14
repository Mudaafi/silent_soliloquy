import axios from 'axios'
import { Telegram } from 'telegram-interface'

// telegram-interface@0.1.9 only exports the API calls from its entry point, so
// formatters and types are imported by path here and nowhere else
export {
  cleanseString,
  convertToHTML,
} from 'telegram-interface/lib/telegram-formatters'
export type {
  TeleBotCommand,
  TeleBotCommandScope,
  TeleBotCommandScopeType,
  TeleCallbackQuery,
  TeleIdType,
  TeleMessage,
  TeleMessageEntities,
  TeleUpdate,
} from 'telegram-interface/lib/@types/telegram-types'

export const ADMIN_ID = process.env.ADMIN_ID || ''

export const tele = new Telegram(process.env.TELE_BOT_KEY || '')

// Bot API methods that telegram-interface does not wrap (as of 0.1.9).
// Rejects with Telegram's description only, since the request URL holds the key
export async function callBotApi<T>(
  method: string,
  payload: Record<string, unknown>,
) {
  try {
    const res = await axios.post<{ result: T }>(
      `https://api.telegram.org/bot${tele.bot_key}/${method}`,
      payload,
    )
    return res.data.result
  } catch (err) {
    const description = axios.isAxiosError(err)
      ? (err.response?.data as { description?: string })?.description
      : undefined
    throw new Error(`${method}: ${description || 'request failed'}`)
  }
}
