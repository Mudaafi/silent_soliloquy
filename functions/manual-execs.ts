import type { HandlerEvent, HandlerResponse } from '@netlify/functions'
import { getFunctionName } from './lib/request'
import { ADMIN_ID, tele } from './lib/telegram'
import type {
  TeleBotCommand,
  TeleBotCommandScope,
  TeleBotCommandScopeType,
} from './lib/telegram'

export async function handler(event: HandlerEvent): Promise<HandlerResponse> {
  let res
  if (event.httpMethod == 'POST') {
    const body = JSON.parse(event.body || '{}')
    // `function` in the body is the original convention and still works
    res = await processPostReq(getFunctionName(event) || body.function, body)
  }
  return {
    statusCode: 200,
    body: res ? res : 'done',
  }
}

async function processPostReq(fn: string | undefined, body: any) {
  switch (fn) {
    case 'setCommands': {
      const botCommands = body.commands.map((command: TeleBotCommand) => {
        return {
          command: command.command as string,
          description: command.description as string,
        } as TeleBotCommand
      }) as Array<TeleBotCommand>
      const scope = {
        type: body.scope.type as TeleBotCommandScopeType,
        chat_id: body.scope.chat_id,
        user_id: body.scope.user_id,
      } as TeleBotCommandScope
      console.log(scope)
      await tele.setMyCommands(botCommands, scope)
      return 'Commands Set'
    }
    case 'setDefaults': {
      const scope = {
        type: 'chat',
        chat_id: process.env.PLANNING_GROUP_ID,
      } as TeleBotCommandScope
      console.log(scope)
      const botCommands = [
        {
          command: 'test',
          description: 'Test Command',
        } as TeleBotCommand,
      ] as Array<TeleBotCommand>
      await tele.setMyCommands(botCommands, scope)
      return 'Default Commands Set'
    }
    case 'test': {
      const photoId = body.payload
      console.log(photoId)
      await tele.sendPhoto(ADMIN_ID, photoId, '')
      return 'Test function executed'
    }
    default:
  }
}
