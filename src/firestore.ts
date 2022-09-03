import { initializeApp } from 'firebase/app'
import {
  collection,
  getFirestore,
  QueryDocumentSnapshot,
} from 'firebase/firestore'
import type { Session } from 'firestore-types'

const firebaseConfig = {
  projectId: 'silent-soliloquy',
}

const app = initializeApp(firebaseConfig)
const firestore = getFirestore(app)

const SESSIONS_DB = 'sessions'

// https://medium.com/swlh/using-firestore-with-typescript-65bd2a602945
// Creates a hash of functions that generically sets types
const converter = <T>() => ({
  toFirestore: (data: T) => data,
  fromFirestore: (snapshot: QueryDocumentSnapshot) => snapshot.data() as T,
})

// Creates a function that obtains the corresponding DB while generically setting types via the converter
const dataPoint = <T>(collectionPath: string) =>
  collection(firestore, collectionPath).withConverter(converter<T>())

// Declare the types of Databases available
export const db = {
  sessions: dataPoint<Session>(SESSIONS_DB),
}
