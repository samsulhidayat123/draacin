import Link from "next/link"

export default function EpisodeList({ episodes, id }) {
  return (
    <div className="grid grid-cols-6 gap-3 mt-5">
      {episodes.map((ep) => (
        <Link
          key={ep.number}
          href={`/watch/${id}/${ep.number}`}
        >
          <div className="bg-red-600 text-white text-center p-2 rounded">
            EP {ep.number}
          </div>
        </Link>
      ))}
    </div>
  )
}