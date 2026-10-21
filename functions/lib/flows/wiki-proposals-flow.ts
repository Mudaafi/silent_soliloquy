import { tele } from '../telegram'
import type { TeleCallbackQuery, TeleMessage } from '../telegram'
import { acknowledge } from '../telegram-extension'
import { entitiesToHtml } from '../telegram-html'

// LLM wiki (librarian) flow: reviewing the librarian's proposals, one bot
// message each with Accept / Decline / Stop buttons. The wiki listener on the
// admin's machine sends them and acts on the decisions (see LLM_WIKI.md); the
// vault is only there. So a press is recorded on the message itself: its
// hidden metadata gets the decision, which reaches the listener as an edit,
// at once or when it next starts

// Callback data the listener's bot-chat.mjs gives the buttons: wp:<action>:<proposal id>
const PROPOSAL_BUTTON = /^wp:([ads]):(p\d+)$/
const DECISIONS = { a: 'accept', d: 'decline', s: 'stop' } as const
type Decision = (typeof DECISIONS)[keyof typeof DECISIONS]

const ANSWER: Record<Decision, string> = {
  accept: 'Accepted',
  decline: 'Declined',
  stop: 'Review stopped',
}

// The status line the listener later replaces with what it did
const LINE: Record<Decision, string> = {
  accept: '<b>✅ Accepted</b> · waiting for the listener',
  decline: '<b>❌ Declined</b> · waiting for the listener',
  stop: '<b>⏹ Review stopped</b> · this proposal and the rest stay pending',
}

const METADATA_LINK = 'tg://metadata/'

/** /wiki_proposals: the listener sends the first pending proposal, if it is running. */
export async function runWikiProposalsFlow(msg: TeleMessage) {
  return acknowledge(msg)
}

export function isProposalButton(data?: string) {
  return PROPOSAL_BUTTON.test(data ?? '')
}

export async function runProposalCallback(callback: TeleCallbackQuery) {
  const [, action, id] = PROPOSAL_BUTTON.exec(callback.data ?? '') ?? []
  const decision = DECISIONS[action as keyof typeof DECISIONS]
  // Stops the button's spinner; a late answer is refused, and the edit still matters more
  await tele
    .answerCallbackQuery(callback.id, ANSWER[decision], false)
    .catch((e) => console.log(e))

  const msg = callback.message
  if (!msg?.text) return
  // The message as it was, without the old metadata and the invisible character it hangs on
  const metadata = (msg.entities || []).filter((e) =>
    (e.url || '').startsWith(METADATA_LINK),
  )
  const end = Math.min(msg.text.length, ...metadata.map((e) => e.offset))
  const body = entitiesToHtml(
    msg.text.slice(0, end),
    (msg.entities || []).filter((e) => !metadata.includes(e) && e.offset < end),
  ).trimEnd()
  const text = tele.embedMetadata(
    { k: 'proposal', id, decision, bot: msg.message_id },
    `${body}\n\n${LINE[decision]}`,
  )
  return tele.updateMessage(msg.chat.id, msg.message_id, text, {
    inline_keyboard: [],
  })
}
