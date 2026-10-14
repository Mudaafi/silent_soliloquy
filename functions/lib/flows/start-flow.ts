import { tele } from '../telegram'
import type { TeleIdType } from '../telegram'
import { db } from '../firestore-interface'

// Login flow: /start <seshId> arrives from the web app's deep link, the user
// compares the verification key and presses the button to confirm

export async function runStart(userId: TeleIdType, seshId: string) {
  await db.sessions.doc(seshId).update({
    accessed: true,
  })
  const sesh = (await db.sessions.doc(seshId).get()).data()
  const msg = `Before you login, please confirm if the code on your screen is the same as <b>${
    sesh!.verificationKey
  }</b>`
  const btns = tele.genInlineButtons([['Log Me In!']], [seshId])
  return tele.sendMessage(userId, msg, btns)
}

export async function callbackStartVerify(userId: TeleIdType, seshId: string) {
  await db.sessions.doc(seshId).update({ verified: true })
  return tele.sendMessage(userId, 'Logged in!')
}
