import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'
import { defineStore } from 'pinia'
import { doc, onSnapshot, DocumentSnapshot } from 'firebase/firestore'
import { db } from '@/firestore'
import type { Session } from 'firestore-types'

const BACKEND_URL = import.meta.env.VITE_BACKEND_BASE || ''

export const useAuthStore = defineStore({
  id: 'auth',
  state: () => ({
    isAuth: false,
    teleId: '-1',
    seshId: '-1',
    seshVerificationKey: '-1',
    isAccessed: false,
    lastCreated: -1,
  }),
  persist: true,
  getters: {},
  actions: {
    async createSeshId() {
      if (
        this.seshId == '' ||
        getDate(this.lastCreated) - getDate(Date.now())
      ) {
        ;[this.seshId, this.seshVerificationKey] = uuidv4().split('-') // ⇨ '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'
        this.isAuth = false
        this.lastCreated = Date.now()
        await axios.get(
          `${BACKEND_URL}?fn=create-session&seshId=${this.seshId}&verificationKey=${this.seshVerificationKey}`,
        )
      }
    },
    async awaitVerification(
      callback: (doc: DocumentSnapshot<Session>) => void,
    ) {
      onSnapshot(doc(db.sessions, this.seshId), async (doc) => {
        if (!doc.data()) {
          await axios.get(
            `${BACKEND_URL}?fn=create-session&seshId=${this.seshId}&verificationKey=${this.seshVerificationKey}`,
          )
          return
        }
        this.isAuth = doc.data()!.verified
        this.teleId = doc.data()!.teleId.toString()
        this.isAccessed = doc.data()!.accessed
        this.lastCreated = Date.now()
        callback(doc)
      })
    },
  },
})

// -- Utility Functions

// Get Date from timestamp
function getDate(timestamp: number) {
  return new Date(timestamp).getDate()
}
