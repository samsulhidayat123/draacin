import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/90 px-4 py-3 text-white backdrop-blur md:px-8">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 sm:flex-nowrap sm:justify-between" suppressHydrationWarning>
        <Link
          href="/"
          className="shrink-0 text-xl font-black uppercase tracking-tight text-red-600 sm:text-2xl"
        >
          GUDANG FILM
        </Link>

        <form action="/search" className="min-w-0 flex-1 sm:max-w-xs">
          <input
            name="q"
            placeholder="Cari film..."
            className="min-h-10 w-full rounded-sm border border-white/20 bg-zinc-950 px-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-white/50"
          />
        </form>
      </div>
    </nav>
  );
}
