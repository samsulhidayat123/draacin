import { searchMovies } from "@/lib/movies"

const BASE_URL = "https://api.consumet.org/movies/dramacool"

export async function getTrending() {
  const res = await fetch(`${BASE_URL}/recent-episodes`, {
    cache: "no-store",
  })

  const data = await res.json()
  return data.results
}

export async function searchDrama(query) {
  try {
    return await searchMovies(query)
  } catch (error) {
    console.error("Search error:", error.message)
    return []
  }
}

export async function getDramaDetail(id) {
  const res = await fetch(`${BASE_URL}/info?id=${id}`)

  const data = await res.json()
  return data
}

export async function getEpisodeStream(id, episode) {
  const res = await fetch(
    `${BASE_URL}/watch/${id}-episode-${episode}`
  )

  const data = await res.json()
  return data
}
