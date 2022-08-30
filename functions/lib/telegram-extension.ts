import { sendMessage } from './telegram-inteface'
import { TeleCallbackQuery, TeleMessage, TeleUpdate } from './tele-types'

const TELE_BOT_KEY = process.env.TELE_BOT_KEY || ''
const MUDAAFI_ID = process.env.ADMIN_ID || ''

// Assume B:id, C:name, D:username, E:join_date, F:isDeparted

export async function processTeleMsg(message: TeleMessage) {
  if (message.photo) {
    return processPhoto(message)
  } else if (message.text) {
    if (!message.from) return
    await sendMessage(TELE_BOT_KEY, message.from.id, JSON.stringify(message))
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

export async function processTeleCallback(callback: TeleCallbackQuery) {}

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

function embedMetadata(metadata: any, text: string) {
  text += `<a href='${JSON.stringify(metadata)}'></a>`
  return text
}

// https://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript
function toTitleCase(str: string) {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  })
}
