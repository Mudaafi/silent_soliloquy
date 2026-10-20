import type { HandlerEvent, HandlerResponse } from '@netlify/functions'
import { getFunctionName, hasAdminToken } from './lib/request'
import { ADMIN_ID, callBotApi, tele } from './lib/telegram'
import type {
  TeleBotCommand,
  TeleBotCommandScope,
  TeleBotCommandScopeType,
} from './lib/telegram'

export async function handler(event: HandlerEvent): Promise<HandlerResponse> {
  if (!hasAdminToken(event)) return { statusCode: 401, body: 'Unauthorized' }

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
      const scope = resolveScope(body.scope)
      console.log(scope)
      await tele.setMyCommands(botCommands, scope)
      return 'Commands Set'
    }
    case 'getCommands': {
      // One scope if given, otherwise every scope worth checking
      const scopes = body.scope ? [resolveScope(body.scope)] : scopesToCheck()
      const result = []
      for (const scope of scopes) {
        try {
          const commands = await callBotApi<TeleBotCommand[]>('getMyCommands', {
            scope,
            language_code: body.language_code,
          })
          result.push({ scope: describeScope(scope), commands })
        } catch (e) {
          result.push({
            scope: describeScope(scope),
            error: (e as Error).message,
          })
        }
      }
      return JSON.stringify(result, null, 2)
    }
    case 'deleteCommands': {
      await callBotApi('deleteMyCommands', {
        scope: resolveScope(body.scope),
        language_code: body.language_code,
      })
      return 'Commands Deleted'
    }
    case 'getWebhook': {
      const info = await callBotApi('getWebhookInfo', {})
      return JSON.stringify(info, null, 2)
    }
    case 'setWebhook': {
      // Registers the webhook so that Telegram signs every update with
      // TELE_WEBHOOK_SECRET, which tele-prompt checks
      if (!body.url) throw new Error('setWebhook needs a url')
      if (!process.env.TELE_WEBHOOK_SECRET)
        throw new Error('TELE_WEBHOOK_SECRET is not set')
      await callBotApi('setWebhook', {
        url: body.url,
        secret_token: process.env.TELE_WEBHOOK_SECRET,
      })
      return 'Webhook Set'
    }
    case 'wikiReflect': {
      // The weekly reflect check of the LLM wiki (librarian). Runs
      // on a separate machine
      await tele.sendMessage(ADMIN_ID, WIKI_REFLECT_TRIGGER)
      return 'Trigger sent'
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

const WIKI_REFLECT_TRIGGER = '🪞 Wiki reflect check'

// Scopes that can be given by name, so that callers do not need to know the
// chat ids
const NAMED_SCOPES: { [name: string]: TeleBotCommandScope | undefined } = {
  adminChat: ADMIN_ID ? { type: 'chat', chat_id: ADMIN_ID } : undefined,
}

// Accepts a scope object, or the name of one of the NAMED_SCOPES
function resolveScope(scope: any): TeleBotCommandScope {
  if (typeof scope == 'string') {
    const named = NAMED_SCOPES[scope]
    if (!named) throw new Error(`Unknown or unconfigured scope "${scope}"`)
    return named
  }
  return {
    type: scope.type as TeleBotCommandScopeType,
    chat_id: scope.chat_id,
    user_id: scope.user_id,
  } as TeleBotCommandScope
}

function scopesToCheck(): TeleBotCommandScope[] {
  const scopes: TeleBotCommandScope[] = [
    { type: 'default' },
    { type: 'all_private_chats' },
    { type: 'all_group_chats' },
    { type: 'all_chat_administrators' },
  ]
  Object.values(NAMED_SCOPES).forEach((scope) => scope && scopes.push(scope))
  return scopes
}

function describeScope(scope: TeleBotCommandScope) {
  const name = Object.keys(NAMED_SCOPES).find(
    (key) => NAMED_SCOPES[key]?.chat_id == scope.chat_id,
  )
  return scope.chat_id && name ? name : scope.type
}
