import { tele } from './telegram'
import type { TeleIdType, TeleMessage } from './telegram'
import { runFindFlow } from './flows/find-flow'
import { runStart } from './flows/start-flow'

// Required values
export interface TeleMessageFromUser extends TeleMessage {
  from: NonNullable<TeleMessage['from']>
}

export interface TeleMessageCommand extends TeleMessageFromUser {
  text: string
}

const COMMANDS = ['/identify', '/start', '/find']

export function isCommand(msg: TeleMessage): msg is TeleMessageCommand {
  if (!msg.text || msg.from == null) return false
  const command = _extractCommand(msg.text)
  return command != null && COMMANDS.includes(command)
}

export async function runCommand(msg: TeleMessageCommand) {
  const command = _extractCommand(msg.text)
  switch (command) {
    case '/identify':
      return _runIdentify(msg.from.id, msg.chat.id)

    case '/start':
      return _runStart(msg.text, msg.from.id)

    case '/find':
      // This will be completed by an external server
      return _runFind(msg.text, msg.chat.id)
  }
}

// ---- Commands
async function _runIdentify(userId: TeleIdType, chatId: TeleIdType) {
  return tele.sendMessage(userId, `Chat ID: ${chatId}`)
}

async function _runStart(input: string, userId: TeleIdType) {
  const [, trailing] = _extractArguments(input)
  return runStart(userId, trailing as string)
}

async function _runFind(input: string, chatId: TeleIdType) {
  const [, trailing] = _extractArguments(input)
  return runFindFlow(chatId, trailing)
}

// ---- Utilities

function _extractCommand(text: string) {
  if (text.includes('/')) {
    const resRegex = text.match(/(\/[^ ]+)/g)
    if (resRegex) return resRegex[0]
  }
}

function _extractArguments(text: string) {
  let leading, trailing
  const leadingRegex = text.match(/(.+)\//)
  const trailingRegex = text.match(/.*\/\w+ (.*)/)

  if (leadingRegex) leading = leadingRegex[1].trim()

  if (trailingRegex) trailing = trailingRegex[1].trim()

  return [leading, trailing]
}
