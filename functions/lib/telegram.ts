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
  TeleMessage,
  TeleMessageEntities,
  TeleUpdate,
} from 'telegram-interface/lib/@types/telegram-types'

export const ADMIN_ID = process.env.ADMIN_ID || ''

export const tele = new Telegram(process.env.TELE_BOT_KEY || '')
