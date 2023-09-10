import * as functions from 'firebase-functions'
import { initializeApp } from 'firebase-admin/app'
import * as logger from 'firebase-functions/logger'
import { Firestore } from 'firebase-admin/firestore'
import { Storage } from '@google-cloud/storage'
import { onCall } from 'firebase-functions/v2/https'

initializeApp()

const firestore = new Firestore()
const storage = new Storage()

const RAW_VIDEOS_BUCKET_NAME = 'jma-mini-youtube-raw-videos'

export const createUser = functions.auth.user().onCreate((user) => {
  const userInfo = {
    uid: user.uid,
    email: user.email,
    photolrl: user.photoURL,
  }

  firestore.collection('users').doc(user.uid).set(userInfo)
  logger.info(`User Created: ${JSON.stringify(userInfo)}`)
})

export const generateUploadUrl = onCall(
  { maxInstances: 1 },
  async (request) => {
    if (!request.auth) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'The function must be called while authenticated.'
      )
    }

    const auth = request.auth
    const data = request.data
    const bucket = storage.bucket(RAW_VIDEOS_BUCKET_NAME)

    // Assume a user is not uploading more than one video per unique second.
    const name = `${auth.uid}-${Date.now()}.${data.fileExtension}`

    const [url] = await bucket.file(name).getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000,
    })

    return { url, name }
  }
)
