import { ADMIN_ID, cleanseString, convertToHTML, tele } from './telegram'
import type {
  TeleCallbackQuery,
  TeleMessage,
  TeleMessageEntities,
  TeleUpdate,
} from './telegram'
import { db } from './firestore-interface'

export async function processTeleMsg(message: TeleMessage) {
  if (message.photo) {
    return processPhoto(message)
  } else if (message.text) {
    if (!message.from) return
    await tele.sendMessage(message.from.id, JSON.stringify(message))
    if (message.from.id.toString() != ADMIN_ID)
      return tele.sendMessage(
        message.from.id,
        'Sorry but I am not authorized to converse with you.',
      )
    if (message.text.includes('/start')) {
      const seshId = message.text.split(' ')[1]
      await db.sessions.doc(seshId).update({
        accessed: true,
      })
      const sesh = (await db.sessions.doc(seshId).get()).data()
      const msg = `Before you login, please confirm if the code on your screen is the same as <b>${
        sesh!.verificationKey
      }</b>`
      const btns = tele.genInlineButtons([['Log Me In!']], [seshId])
      return tele.sendMessage(message.from.id, msg, btns)
    }
    if (message.text == '/identify')
      return tele.sendMessage(message.from.id, `Chat ID: ${message.chat.id}`)
  }
}

export async function processTeleCallback(callback: TeleCallbackQuery) {
  const seshId = callback.data
  if (!seshId) return
  await db.sessions.doc(seshId).update({ verified: true })
  return tele.sendMessage(callback.from.id, 'Logged in!')
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
