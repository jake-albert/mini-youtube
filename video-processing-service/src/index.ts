import express from 'express'
import { convertVideo, deleteProcessedVideo, deleteRawVideo, downloadRawVideo, setupDirectories, uploadProcessedVideo } from './storage'
import { isVideoNew, setVideo } from './firestore'

setupDirectories()

const app = express()
app.use(express.json())

app.post('/process-video', async (req, res) => {
  let data
  try {
    // See: https://cloud.google.com/run/docs/tutorials/pubsub#looking_at_the_code
    const message = Buffer.from(req.body.message.data, 'base64').toString('utf8')
    data = JSON.parse(message)
    if (!data.name) {
      throw new Error('Invalid message payload received')
    }
  } catch (error) {
    console.log(error)
    return res.status(400).send('Bad Request: missing filename')
  }

  const inputVideoName = data.name // <UID>-<DATE>.<EXTENSION>
  const outputVideoName = `processed-${inputVideoName}`
  const videoId = inputVideoName.split('.')[0]

  if (!(await isVideoNew(outputVideoName))) {
    return res.status(400).send('Bad Request: video already processing or processed')
  } else {
    await setVideo(videoId, {
      id: videoId,
      uid: videoId.split('.')[0],
      status: 'processing' 
    })
  }

  await downloadRawVideo(inputVideoName)

  try {
    await convertVideo(inputVideoName, outputVideoName)
  } catch (error) {
    await Promise.all([
      deleteRawVideo(inputVideoName),
      deleteProcessedVideo(outputVideoName)
    ])

    console.error(error)
    return res.status(500).send('Internal Server Error: video processing failed')
  }

  await uploadProcessedVideo(outputVideoName)

  await setVideo(videoId, {
    status: 'processed',
    filename: outputVideoName
  })

  await Promise.all([
    deleteRawVideo(inputVideoName),
    deleteProcessedVideo(outputVideoName)
  ])

  return res.status(200).send('Processing finished successfully')
})

// NOTE: In the environment of Cloud Run this evaluates to 8080
const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Video processing service listening at http://localhost:${port}`)
})
