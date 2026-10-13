import type { HandlerEvent, HandlerResponse } from '@netlify/functions'
import { getFunctionName } from './lib/request'
import { ADMIN_ID, cleanseString, tele } from './lib/telegram'

export async function handler(event: HandlerEvent): Promise<HandlerResponse> {
  let res = 'Received request'
  const params = {
    ...event.queryStringParameters,
    function: getFunctionName(event),
  } as RequestQueryParams

  if (event.httpMethod == 'POST') {
    let body = null
    const bodyContentType = event.headers['content-type']
    if (event.body == null) body = { function: 'Error' }
    else if (bodyContentType == 'application/json')
      body = JSON.parse(event.body)
    else if (bodyContentType == 'application/x-www-form-urlencoded')
      body = paramsToObject(new URLSearchParams(event.body))
    res = await processPostReq(params, body as PostEndpointBody)
  } else if (event.httpMethod == 'GET') {
    res = await processGetReq(params as GetEndpointParams)
  }
  return {
    statusCode: 200,
    body: res ? res : 'done',
  }
}

async function processGetReq(params: GetEndpointParams): Promise<string> {
  switch (params.function) {
    case 'test':
      await tele.sendMessage(ADMIN_ID, params.data)
      return 'success'
    default:
      return 'Get Request Defaulted'
  }
}

async function processPostReq(
  params: RequestQueryParams,
  body: PostEndpointBody,
): Promise<string> {
  if (!params.function) {
    await tele.sendMessage(
      ADMIN_ID,
      `Post Request Defaulted\n\n<b>Body:</b>\n${formatJsonBlock(body)}`,
    )
    return 'External Post Request Detected'
  }

  switch (params.function) {
    case 'test':
      return 'success'
    default:
      return 'Post Request Defaulted'
  }
}

interface PostEndpointBody {
  function: string
  data: string
}

interface RequestQueryParams {
  function?: string
}

interface GetEndpointParams extends RequestQueryParams {
  data: string
}

// Telegram caps messages at 4096 chars after parsing, leave room for the header
const MAX_JSON_LENGTH = 4000

function formatJsonBlock(data: any) {
  let json = JSON.stringify(data, null, 2)
  // Truncate before escaping so an HTML entity is never cut in half
  if (json.length > MAX_JSON_LENGTH)
    json = json.slice(0, MAX_JSON_LENGTH) + '\n... (truncated)'
  return `<pre><code class="language-json">${cleanseString(json)}</code></pre>`
}

function paramsToObject(params: URLSearchParams) {
  const jsonObj: { [key: string]: any } = {}
  Array.from(params.keys()).forEach((key) => (jsonObj[key] = params.get(key)))
  return jsonObj
}
