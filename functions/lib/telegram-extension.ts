import { ADMIN_ID, cleanseString, convertToHTML, tele } from './telegram'
import type {
  TeleCallbackQuery,
  TeleMessage,
  TeleMessageEntities,
  TeleUpdate,
} from './telegram'
import { runCallbackFlow } from './telegram-callbacks'
import { isCommand, runCommand } from './telegram-commands'
import type { TeleMessageFromUser } from './telegram-commands'

export async function processTeleMsg(message: TeleMessage) {
  if (!isAdmin(message)) return rejectNonAdmin(message)

  if (message.photo) {
    return processPhoto(message)
  } else if (isCommand(message)) {
    return runCommand(message)
  }
}

export async function processTeleCallback(callback: TeleCallbackQuery) {
  if (callback.from.id.toString() != ADMIN_ID) return

  return runCallbackFlow(callback)
}

function isAdmin(msg: TeleMessage): msg is TeleMessageFromUser {
  return msg.from != null && msg.from.id.toString() == ADMIN_ID
}

async function rejectNonAdmin(msg: TeleMessage) {
  if (!msg.text || !msg.from) return
  return tele.sendMessage(
    msg.from.id,
    'Sorry but I am not authorized to converse with you.',
  )
}

export async function processTeleError(prompt: TeleUpdate, errorMsg: Error) {
  await tele.sendMessage(ADMIN_ID, `<b>Error encountered</b>:`)
  await tele.sendMessage(ADMIN_ID, JSON.stringify(prompt))
  await tele.sendMessage(ADMIN_ID, `${errorMsg.message}`)
}

export async function processPhoto(message: TeleMessage) {
  if (message.from!.id.toString() != ADMIN_ID) return
  return tele.sendMessage(
    message.from!.id,
    `<b>Here's the photo ID:</b>\n${message.photo![2].file_id}`,
  )
}

// Helper functions
export function formatTeleTextToHtml(
  textMsg: string,
  formatting: TeleMessageEntities[],
) {
  if (!textMsg) return 'empty'
  // malice removal
  textMsg = cleanseString(textMsg)
  textMsg = textMsg.replace(/"/g, "'")
  if (formatting) {
    textMsg = convertToHTML(textMsg, formatting)
  }
  return textMsg
}
