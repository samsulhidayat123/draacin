function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-sm bg-[#181818] ring-1 ring-white/5">
      <div className="aspect-[2/3] animate-pulse bg-zinc-900" />
      <div className="space-y-2.5 p-2.5">
        <div className="h-3 w-11/12 animate-pulse rounded-sm bg-zinc-800" />
        <div className="h-3 w-7/12 animate-pulse rounded-sm bg-zinc-900" />
        <div className="h-4 w-20 animate-pulse rounded-sm bg-zinc-900" />
      </div>
    </div>
  );
}

export default function CatalogSkeleton({
  title = "Memuat katalog",
  subtitle = "Mengambil data terbaru dari MongoDB.",
}) {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <section className="border-b border-white/10 bg-[#111] px-4 py-10 md:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 h-3 w-32 animate-pulse rounded-sm bg-red-900/60" />
          <div className="h-10 w-full max-w-2xl animate-pulse rounded-sm bg-zinc-800 md:h-16" />
          <p className="mt-4 h-4 w-full max-w-xl animate-pulse rounded-sm bg-zinc-900" />
        </div>
      </section>

      <section className="px-4 py-8 md:px-8 md:py-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xl font-black uppercase tracking-tight">
                {title}
              </p>
              <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 5 }, (_, index) => (
                <span
                  key={index}
                  className="h-9 w-20 animate-pulse rounded-sm bg-zinc-900"
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 12 }, (_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
