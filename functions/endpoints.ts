import type { HandlerEvent, HandlerContext } from '@netlify/functions'
import { sendMessage } from './lib/telegram-inteface'

const TELE_BOT_KEY = process.env.TELE_BOT_KEY || ''
const ADMIN_ID = process.env.ADMIN_ID || ''

export async function handler(event: HandlerEvent, context: HandlerContext) {
  var res = 'Received request'
  const params = event.queryStringParameters as unknown as RequestQueryParams

  if (event.httpMethod == 'POST') {
    let body = null
    let bodyContentType = event.headers['content-type']
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
      await sendMessage(TELE_BOT_KEY, ADMIN_ID, params.data)
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
    await sendMessage(
      TELE_BOT_KEY,
      ADMIN_ID,
      `Post Request Defaulted\n\n<b>Body:</b>\n${JSON.stringify(body)}`,
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
  function: string
}

interface GetEndpointParams extends RequestQueryParams {
  data: string
}

function paramsToObject(params: URLSearchParams) {
  let jsonObj: { [key: string]: any } = {}
  Array.from(params.keys()).forEach((key) => (jsonObj[key] = params.get(key)))
  return jsonObj
}
