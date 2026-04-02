async function getEpisodeStream(id, episode) {
  try {
    const res = await fetch(
      `https://api.consumet.org/movies/dramacool/watch/${id}-episode-${episode}`,
      {
        cache: "no-store",
      }
    )

    const data = await res.json()
    return data
  } catch (error) {
    console.error("Fetch stream error:", error)
    return null
  }
}

export default async function WatchPage({ params }) {
  const { id, episode } = await params

  const stream = await getEpisodeStream(id, episode)

  if (!stream) {
    return (
      <div className="p-10 text-center text-white">
        Episode tidak ditemukan
      </div>
    )
  }

  const video = stream.sources?.[0]?.url

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-5">
      
      <h1 className="text-xl mb-5">
        Drama {id} Episode {episode}
      </h1>

      <div className="w-full max-w-5xl aspect-video bg-black">
        <iframe
          src={video}
          className="w-full h-full"
          allowFullScreen
        />
      </div>

    </div>
  )
}