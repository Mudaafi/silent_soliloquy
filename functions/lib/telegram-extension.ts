import { cleanseString, convertToHTML, sendMessage } from './telegram-inteface'
import type {
  TeleCallbackQuery,
  TeleMessage,
  TeleMessageEntities,
  TeleUpdate,
} from './tele-types'
import { db } from './firestore-interface'

const TELE_BOT_KEY = process.env.TELE_BOT_KEY || ''
const MUDAAFI_ID = process.env.ADMIN_ID || ''

// Assume B:id, C:name, D:username, E:join_date, F:isDeparted

export async function processTeleMsg(message: TeleMessage) {
  if (message.photo) {
    return processPhoto(message)
  } else if (message.text) {
    if (!message.from) return
    await sendMessage(TELE_BOT_KEY, message.from.id, JSON.stringify(message))
    if (message.text == '/start') {
      var seshId = message.text.split(' ')[1]
      await db.sessions.doc(seshId).update({
        accessed: true,
      })
      var sesh = (await db.sessions.doc(seshId).get()).data()
      var msg = embedMetadata(
        sesh!.seshId,
        `Before you login, please confirm if the code on your screen is the same as <b>${
          sesh!.verificationKey
        }</b>`,
      )
      return sendMessage(TELE_BOT_KEY, message.from.id, msg)
    }
    if (message.from.id.toString() != MUDAAFI_ID)
      return sendMessage(
        TELE_BOT_KEY,
        message.from.id,
        'Sorry but I am not authorized to converse with you.',
      )
    if (message.text == '/identify')
      return sendMessage(
        TELE_BOT_KEY,
        message.from.id,
        `Chat ID: ${message.chat.id}`,
      )
  }
}

export async function processTeleCallback(callback: TeleCallbackQuery) {
  if (!callback.message || !callback.message.text) return

  if (callback.message.entities) {
    const seshId = extractMetadata(
      formatTeleTextToHtml(callback.message.text, callback.message.entities),
    )
    if (!seshId) return
    await db.sessions.doc(seshId).update({ verified: true })
    return sendMessage(TELE_BOT_KEY, callback.from.id, 'Logged in!')
  }
}

export async function processTeleError(prompt: TeleUpdate, errorMsg: Error) {
  await sendMessage(TELE_BOT_KEY, MUDAAFI_ID, `<b>Error encountered</b>:`)
  await sendMessage(TELE_BOT_KEY, MUDAAFI_ID, JSON.stringify(prompt))
  await sendMessage(TELE_BOT_KEY, MUDAAFI_ID, `${errorMsg.message}`)
}

export async function processPhoto(message: TeleMessage) {
  if (message.from!.id.toString() != process.env.ADMIN_ID) return
  return sendMessage(
    TELE_BOT_KEY,
    message.from!.id,
    `<b>Here's the photo ID:</b>\n${message.photo![2].file_id}`,
  )
}

/* Utility Functions */

function _identifyCommand(command: string, textMsg: string) {
  return textMsg.indexOf(command) >= 0
}

export function embedMetadata(metadata: any, text: string) {
  text += `<a href="tg://metadata/${JSON.stringify(metadata)
    .split('"')
    .join('`')}/end">\u200b</a>`
  return text
}

export function extractMetadata(htmlText: string): any {
  var res = htmlText.split('tg://metadata/')[1]
  if (!res) return null
  res = res.split('/end')[0]
  res = res.split('`').join('"')
  let obj = JSON.parse(res.split('/end')[0])
  // Telegram replaces whitespace in links to %20
  Object.keys(obj).forEach((key) => {
    let value = obj[key]
    if (typeof value == 'string') {
      obj[key] = value.replace(/%20/g, ' ')
    } else if (typeof value == 'object') {
      if (Array.isArray(value))
        obj[key] = value.map((elem) =>
          typeof elem == 'string' ? elem.replace(/%20/g, ' ') : elem,
        )
    }
  })
  return obj
}

// Helper functions
export function formatTeleTextToHtml(
  textMsg: string,
  formatting: [TeleMessageEntities],
) {
  if (!textMsg) return 'empty'
  // malice removal
  textMsg = cleanseString(textMsg)
  textMsg = textMsg.replace(/\"/g, "'")
  if (formatting) {
    textMsg = convertToHTML(textMsg, formatting)
  }
  return textMsg
}

// https://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript
function toTitleCase(str: string) {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  })
}
