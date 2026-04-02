const BASE_URL = "https://api.consumet.org/movies/dramacool"

export async function getTrending() {
  const res = await fetch(`${BASE_URL}/recent-episodes`, {
    cache: "no-store",
  })

  const data = await res.json()
  return data.results
}

export async function searchDrama(query) {
  const res = await fetch(`${BASE_URL}/${query}`)

  const data = await res.json()
  return data.results
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