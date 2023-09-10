import { HttpsCallableResult, getFunctions, httpsCallable } from 'firebase/functions'

interface GenerateUploadUrlResponse {
    url: string
    name: string
}

const functions = getFunctions()

const generateUploadUrl = httpsCallable (functions, 'generateUploadUrl')

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