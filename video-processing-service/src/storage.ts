import { Storage } from '@google-cloud/storage'
import fs from 'fs'
import ffmpeg from 'fluent-ffmpeg'

const RAW_VIDEOS_BUCKET_NAME = 'jma-mini-youtube-raw-videos'
const PROCESSED_VIDEOS_BUCKET_NAME = 'jma-mini-youtube-processed-videos'

const LOCAL_RAW_VIDEOS_DIRECTORY = './raw-videos'
const LOCAL_PROCESSED_VIDEOS_DIRECTORY = './processed-videos'

const storage = new Storage()

const constructLocalRawVideoPath = 
  (videoName: string) => `${LOCAL_RAW_VIDEOS_DIRECTORY}/${videoName}`
const constructLocalProcessedVideoPath = 
  (videoName: string) => `${LOCAL_PROCESSED_VIDEOS_DIRECTORY}/${videoName}`

export function setupDirectories() {
  ensureDirectoryExistence(LOCAL_RAW_VIDEOS_DIRECTORY)
  ensureDirectoryExistence(LOCAL_PROCESSED_VIDEOS_DIRECTORY)
}

export function convertVideo (rawVideoName: string, processedVideoName: string) {
  return new Promise<void>((resolve, reject) => {
    ffmpeg(constructLocalRawVideoPath(rawVideoName))
      .outputOptions('-vf', 'scale=-1:360') //360p
      .on('end', () => {
        console.log('Processing finished successfully.')
        resolve()
      })
      .on('error', (error) => {
        console.error(`An error occurred: ${error.message}`)
        reject(error)
      })
      .save(constructLocalProcessedVideoPath(processedVideoName))
  })
}

export async function downloadRawVideo(videoName: string) {
  const localRawVideoPath = constructLocalRawVideoPath(videoName)

  await storage.bucket(RAW_VIDEOS_BUCKET_NAME)
    .file(videoName)
    .download({destination: localRawVideoPath })

  console.log(`gs://${RAW_VIDEOS_BUCKET_NAME}/${videoName} downloaded to ${localRawVideoPath}`)
}

export async function uploadProcessedVideo(videoName: string) {
  const localProcessedVideoPath = constructLocalProcessedVideoPath(videoName)

  const bucket = storage.bucket(PROCESSED_VIDEOS_BUCKET_NAME)
  await bucket.upload(localProcessedVideoPath, { destination: videoName })
  // NOTE: We need to do this becuase even though this bucket is not without public access, it is
  // still set to 'Subject to object ACLs'.
  await bucket.file(videoName).makePublic()

  console.log(
    `${localProcessedVideoPath} uploaded to gs://${PROCESSED_VIDEOS_BUCKET_NAME}/${videoName}`
  )
}

export function deleteRawVideo (videoName: string) {
  return deleteFile(constructLocalRawVideoPath(videoName))
}

export function deleteProcessedVideo (videoName: string) {
  return deleteFile(constructLocalProcessedVideoPath(videoName))
}

function deleteFile(path: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(path)) {
      fs.unlink(path, (error) => {
        if (error) {
          console.error(`Failed to delete file at ${path}`, error)
          reject(error)
        } else {
          console.log(`File at ${path} deleted`)
          resolve
        }
      })
    } else {
      console.warn(`File not found at ${path}, skipping the delete`)
      resolve()
    }
  })
}

function ensureDirectoryExistence(path: string) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true })
    console.log(`Directory created at ${path}`)
  }
}