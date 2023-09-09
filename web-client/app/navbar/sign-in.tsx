'use client'

import { Fragment } from 'react'

import { signInWithGoogle, signOut } from '../firebase/firebase'
import styles from './sign-in.module.css'
import { User } from 'firebase/auth'

interface Props {
    user: User | null
}

export default function SignIn ({ user }: Props) {
  return (
    <Fragment>
      { user ?
        (
          <button className={styles.signIn} onClick={signOut}>Sign Out</button>
        ) : (
          <button className={styles.signIn} onClick={signInWithGoogle}>Sign In</button>
        )
      }
    </Fragment>
  )
}