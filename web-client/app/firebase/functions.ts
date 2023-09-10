import { HttpsCallableResult, getFunctions, httpsCallable } from 'firebase/functions'
import { functions } from './firebase'

interface GenerateUploadUrlResponse {
    url: string
    name: string
}


const generateUploadUrl = httpsCallable (functions, 'generateUploadUrl')
const getVideosFunction = httpsCallable (functions, 'getVideos')

export async function uploadVideo (file: File) {
  const response = await generateUploadUrl({
    fileExtension: file.name.split('.').pop()
  })
  const data = response.data as GenerateUploadUrlResponse

  await fetch(data.url, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type
    }
  })
}

export interface Video {
  id?: string,
  uid?: string,
  filename?: string,
  status?: 'processing' | 'processed',
  title?: string,
  description?: string  
}

export async function getVideos () {
  const response = await getVideosFunction()
  return response.data as Video[]
}
