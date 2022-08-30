import type { TeleBotCommand, TeleBotCommandScope } from './lib/tele-types'
import { TeleBotCommandScopeType } from './lib/tele-types'
import { sendPhoto, setMyCommands } from './lib/telegram-inteface'

const TELE_BOT_KEY = process.env.TELE_BOT_KEY || ''

export async function handler(event: any, context: any) {
  if (event.httpMethod == 'POST') {
    const body = JSON.parse(event.body)
    var res = await processPostReq(body)
  }
  return {
    statusCode: 200,
    body: res ? res : 'done',
  }
}

async function processPostReq(body: any) {
  switch (body.function) {
    case 'setCommands':
      var botCommands = body.commands.map((command: TeleBotCommand) => {
        return {
          command: command.command as string,
          description: command.description as string,
        } as TeleBotCommand
      }) as Array<TeleBotCommand>
      var scope = {
        type: body.scope.type as TeleBotCommandScopeType,
        chat_id: body.scope.chat_id,
        user_id: body.scope.user_id,
      } as TeleBotCommandScope
      console.log(scope)
      await setMyCommands(TELE_BOT_KEY, botCommands, scope)
      return 'Commands Set'
    case 'setDefaults':
      var scope = {
        type: TeleBotCommandScopeType.specific_chat,
        chat_id: process.env.PLANNING_GROUP_ID,
      } as TeleBotCommandScope
      console.log(scope)
      var botCommands = [
        {
          command: 'test',
          description: 'Test Command',
        } as TeleBotCommand,
      ] as Array<TeleBotCommand>
      await setMyCommands(TELE_BOT_KEY, botCommands, scope)
      return 'Default Commands Set'
    case 'test':
      let photoId = body.payload
      console.log(photoId)
      await sendPhoto(TELE_BOT_KEY, process.env.ADMIN_ID || '', photoId, '')
      return 'Test function executed'
    default:
  }
}
