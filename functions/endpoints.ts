import { sendMessage } from './lib/telegram-inteface'

const TELE_BOT_KEY = process.env.TELE_BOT_KEY || ''
const ADMIN_ID = process.env.ADMIN_ID || ''

export async function handler(event: any, context: any) {
  var res = 'Received request'
  if (event.httpMethod == 'POST') {
    const body = JSON.parse(event.body)
    res = await processPostReq(body as PostEndpointBody)
  } else if (event.httpMethod == 'GET') {
    const params = event.queryStringParameters
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

async function processPostReq(body: PostEndpointBody): Promise<string> {
  switch (body.function) {
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

interface GetEndpointParams {
  function: string
  data: string
}
