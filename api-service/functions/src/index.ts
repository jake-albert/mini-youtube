import * as functions from 'firebase-functions'
import { initializeApp } from 'firebase-admin/app'
import * as logger from 'firebase-functions/logger'
import { Firestore } from 'firebase-admin/firestore'

initializeApp()

const firestore = new Firestore()

export const createUser = functions.auth.user().onCreate((user) => {
  const userInfo = {
    uid: user.uid,
    email: user.email,
    photolrl: user.photoURL,
  }

  firestore.collection('users').doc(user.uid).set(userInfo)
  logger.info(`User Created: ${JSON.stringify(userInfo)}`)
})
