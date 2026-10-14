import { tele } from '../telegram'
import type { TeleIdType } from '../telegram'

// Find flow: /find <what to look for>. The answer does not come from here: a
// Claude session on the admin's machine reads the chat, searches the wiki and
// sends the links back as the bot (see LLM_WIKI.md). The webhook only shows
// straight away that the command was received

// Every "Thinking..." placeholder uses this id, so the one the local session
// sends while it works renews this one instead of adding a second
export const THINKING_DRAFT_ID = 1

export async function runFindFlow(
  chatId: TeleIdType,
  query: string | undefined,
) {
  if (!query)
    return tele.sendMessage(
      chatId,
      'Send /find followed by what you are looking for.',
    )
  return showThinking(chatId)
}

// Telegram's placeholder for an answer that is being worked out: an empty
// message draft, shown as "Thinking..." for about 30 seconds or until the
// bot's next message. Falls back to "typing..." if the draft is refused
export async function showThinking(chatId: TeleIdType) {
  try {
    return await tele.sendMessageDraft(Number(chatId), THINKING_DRAFT_ID)
  } catch (e) {
    return tele.sendChatAction(chatId, 'typing')
  }
}
