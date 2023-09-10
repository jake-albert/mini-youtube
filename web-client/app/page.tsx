import Link from 'next/link'
import Image from 'next/image'
import { getVideos } from './firebase/functions'
import styles from './page.module.css'

export default async function Home() {
  // NOTE: This is a server-side component so logging here would show in terminal for dev server,
  // but not in browser.
  const videos = await getVideos()

  return (
    <main>
      {
        videos.map((video) => (
          <Link href={`/watch?v=${video.filename}`} key={video.id}>
            { /* TODO: Generate thumbnail for each video on upload */ }
            <Image src={'/thumbnail.png'} alt='video' width={120} height={80}
              className={styles.thumbnail}/>
          </Link>
        ))
      }
    </main>
  )
}

// NOTE: In dev mode with a local server, Next.js does not cache server-side fetch requests.
// When deploying to production server it automaically will so we'd not be able to see new videos.
// See: https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating#segment-level-caching
export const revalidate = 30
