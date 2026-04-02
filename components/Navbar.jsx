import Link from "next/link"

export default function Navbar() {
  return (
    <nav className="bg-black text-white p-4 flex justify-between">
      <Link href="/" className="text-2xl font-bold">
        DRACIN
      </Link>

      <form action="/search">
        <input
          name="q"
          placeholder="Search drama..."
          className="px-3 py-1 text-black rounded"
        />
      </form>
    </nav>
  )
}