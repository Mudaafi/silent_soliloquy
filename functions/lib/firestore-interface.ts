import admin from 'firebase-admin'
import type { ServiceAccount } from 'firebase-admin'
import type { Session } from '../../firestore-types'
import { uuidv4 } from '@firebase/util'
import type { DocumentData } from '@firebase/firestore'

const serviceAccount: ServiceAccount = {
  projectId: 'silent-soliloquy',
  // Importing Env Vars from Netlify results in escaped \n chars
  privateKey: process.env.FIRESTORE_KEY!.replace(
    new RegExp('\\\\n', 'g'),
    '\n',
  ),
  clientEmail:
    'firebase-adminsdk-lznr7@silent-soliloquy.iam.gserviceaccount.com',
}

admin.initializeApp(
  {
    credential: admin.credential.cert(serviceAccount),
  },
  uuidv4(),
)

const SESSIONS_DB = 'sessions'

// https://medium.com/swlh/using-firestore-with-typescript-65bd2a602945
// Creates a hash of functions that generically sets types
const converter = <T>() => ({
  toFirestore: (data: T) => data,
  fromFirestore: (snap: FirebaseFirestore.QueryDocumentSnapshot) =>
    snap.data() as T,
})

// Creates a function that obtains the corresponding DB while generically setting types via the converter
const dataPoint = <T extends DocumentData>(collectionPath: string) =>
  admin.firestore().collection(collectionPath).withConverter(converter<T>())

// Declare the types of Databases available
export const db = {
  sessions: dataPoint<Session>(SESSIONS_DB),
}
