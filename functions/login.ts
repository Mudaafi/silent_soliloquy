import type { HandlerEvent, HandlerContext } from '@netlify/functions'
import type { Session } from '../firestore-types'
import { db } from './lib/firestore-interface'

interface EventQueryStringParameters {
  [name: string]: string | undefined
}

class LoginError extends Error {
  statusCode
  constructor(statusCode: number, msg: string) {
    super(msg)
    this.statusCode = statusCode
  }
}

export async function handler(event: HandlerEvent, context: HandlerContext) {
  var res = null
  try {
    if (event.httpMethod == 'POST' && event.body) {
      const body = JSON.parse(event.body)
      res = await processPostReq(body)
    } else if (event.httpMethod == 'GET' && event.queryStringParameters) {
      const queryStrParams = event.queryStringParameters
      if (!queryStrParams['fn']) return
      res = await processGetReq(queryStrParams)
    }
    return {
      statusCode: 200,
      body: res ? res : 'done',
    }
  } catch (e) {
    if (e instanceof LoginError) {
      return {
        statusCode: e.statusCode,
        body: e.message,
      }
    }
    return {
      statusCode: 500,
      body: (e as Error).message || 'an error occurred',
    }
  }
}

async function processPostReq(body: any) {}

async function processGetReq(queryStrParams: EventQueryStringParameters) {
  const fn = queryStrParams['fn']
  switch (fn) {
    case 'create-session':
      var seshId = queryStrParams['seshId']
      var verificationKey = queryStrParams['verificationKey']
      let newSesh: Session = {
        seshId: seshId!,
        verificationKey: verificationKey!,
        teleId: -1,
        accessed: false,
        verified: false,
      }
      await db.sessions.doc(seshId!).create(newSesh)
      return 'Session Successfully Created'

    case 'login-check':
      var seshId = queryStrParams['seshId']
      var doc = await db.sessions.doc(seshId!).get()
      console.log(JSON.stringify(doc.data()))
      return doc.data()!.verified.toString()

    case 'test':
      var doc = await db.sessions.doc('123').get()
      console.log(doc.updateTime!.toDate())
      console.log(Date.now())
      return
    default:
      throw new LoginError(400, 'Unrecognized Get Request')
  }
}
