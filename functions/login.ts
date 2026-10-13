import type { HandlerEvent, HandlerResponse } from '@netlify/functions'
import type { Session } from '../firestore-types'
import { db } from './lib/firestore-interface'
import { getFunctionName } from './lib/request'

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

export async function handler(event: HandlerEvent): Promise<HandlerResponse> {
  let res = null
  try {
    if (event.httpMethod == 'POST' && event.body) {
      const body = JSON.parse(event.body)
      res = await processPostReq(body)
    } else if (event.httpMethod == 'GET' && event.queryStringParameters) {
      res = await processGetReq(
        getFunctionName(event),
        event.queryStringParameters,
      )
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

async function processPostReq(body: any) {
  // Not yet implemented
}

async function processGetReq(
  fn: string | undefined,
  queryStrParams: EventQueryStringParameters,
) {
  const seshId = queryStrParams['seshId']
  switch (fn) {
    case 'create-session': {
      const verificationKey = queryStrParams['verificationKey']
      const newSesh: Session = {
        seshId: seshId!,
        verificationKey: verificationKey!,
        teleId: -1,
        accessed: false,
        verified: false,
      }
      await db.sessions.doc(seshId!).create(newSesh)
      return 'Session Successfully Created'
    }

    case 'mark-access':
      await db.sessions.doc(seshId!).update({ accessed: true })
      return

    case 'login-check': {
      const doc = await db.sessions.doc(seshId!).get()
      console.log(JSON.stringify(doc.data()))
      return doc.data()!.verified.toString()
    }

    case 'test': {
      const doc = await db.sessions.doc('123').get()
      console.log(doc.updateTime!.toDate())
      console.log(Date.now())
      return
    }
    default:
      throw new LoginError(400, 'Unrecognized Get Request')
  }
}
