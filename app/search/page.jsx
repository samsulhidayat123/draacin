import { searchDrama } from "@/lib/api"
import DramaCard from "@/components/DramaCard"

export default async function Search({ searchParams }) {

  const q = searchParams.q

  const dramas = await searchDrama(q)

  return (
    <div className="p-5 grid grid-cols-2 md:grid-cols-6 gap-4">

      {dramas.map((drama) => (
        <DramaCard key={drama.id} drama={drama} />
      ))}

    </div>
  )
}