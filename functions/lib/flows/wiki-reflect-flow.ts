import type { TeleMessage } from '../telegram'
import { acknowledge } from '../telegram-extension'

// LLM wiki (librarian) flow: /wiki_reflect asks for the wiki's full review.
// The review runs on the admin's machine, where the wiki listener picks the
// command up and later sends a summary (see LLM_WIKI.md). It runs only if the
// listener is running when the command arrives, so the reaction says the bot
// received it, not that a review has started

export async function runWikiReflectFlow(msg: TeleMessage) {
  return acknowledge(msg)
}
