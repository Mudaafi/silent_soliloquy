import type { TeleMessageEntities } from './telegram'

// A received message's text and entities, back as the HTML that would send it again.
// Entities Telegram sends are nested, never crossed; offsets are in UTF-16 units,
// which is how JavaScript indexes strings

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function tagsFor(e: TeleMessageEntities): [string, string] | null {
  switch (e.type) {
    case 'bold':
      return ['<b>', '</b>']
    case 'italic':
      return ['<i>', '</i>']
    case 'underline':
      return ['<u>', '</u>']
    case 'strikethrough':
      return ['<s>', '</s>']
    case 'spoiler':
      return ['<tg-spoiler>', '</tg-spoiler>']
    case 'code':
      return ['<code>', '</code>']
    case 'pre':
      return e.language
        ? [`<pre><code class="language-${escapeHtml(e.language)}">`, '</code></pre>']
        : ['<pre>', '</pre>']
    case 'text_link':
      return [`<a href="${escapeHtml(e.url || '').replace(/"/g, '&quot;')}">`, '</a>']
    case 'text_mention':
      return e.user ? [`<a href="tg://user?id=${e.user.id}">`, '</a>'] : null
    case 'blockquote':
      return ['<blockquote>', '</blockquote>']
    case 'expandable_blockquote':
      return ['<blockquote expandable>', '</blockquote>']
    default:
      // url, mention, hashtag, bot_command…: Telegram finds those again by itself
      return null
  }
}

export function entitiesToHtml(text: string, entities: TeleMessageEntities[] = []) {
  const opens = new Map<number, string[]>()
  const closes = new Map<number, string[]>()
  const sorted = [...entities].sort((a, b) => a.offset - b.offset || b.length - a.length)
  for (const e of sorted) {
    const tags = tagsFor(e)
    if (!tags) continue
    const end = e.offset + e.length
    opens.set(e.offset, [...(opens.get(e.offset) || []), tags[0]])
    // An entity opened later is inside, so it closes first
    closes.set(end, [tags[1], ...(closes.get(end) || [])])
  }
  let html = ''
  for (let i = 0; i <= text.length; i++) {
    html += (closes.get(i) || []).join('') + (opens.get(i) || []).join('')
    if (i < text.length) html += escapeHtml(text[i])
  }
  return html
}
