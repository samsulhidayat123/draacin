// app/page.jsx
import { connection } from 'next/server';
import CatalogErrorState from '@/components/CatalogErrorState';
import CatalogFilter from '@/components/CatalogFilter';
import CatalogPagination from '@/components/CatalogPagination';
import RealtimeMovieGrid from '@/components/RealtimeMovieGrid';
import { getMoviesPage } from '@/lib/movies';

const VALID_TYPES = new Set(["movie", "series", "kdrama", "anime", "dracin", "netflix", "film_indo"]);
const PAGE_LIMIT = 60;

function typeLabel(type) {
  const labels = {
    anime: "Anime",
    kdrama: "Kdrama",
    movie: "Movie",
    series: "Series",
    dracin: "Drama China",
    netflix: "Netflix",
    film_indo: "Film Indo",
  };

  return labels[type] || "Semua";
}

async function getCatalog({ page, type }) {
  try {
    const catalog = await getMoviesPage({
      page,
      limit: PAGE_LIMIT,
      type,
    });

    return { catalog, loadError: "" };
  } catch (error) {
    console.error("Error fetching movies from MongoDB:", error);

    return {
      loadError:
        "Database katalog belum merespons. Periksa koneksi MongoDB atau environment server.",
      catalog: {
        data: [],
        pagination: {
          page: 1,
          limit: PAGE_LIMIT,
          total: 0,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      },
    };
  }
}

export default async function Home({ searchParams }) {
  await connection();
  const params = await searchParams;
  const rawType = String(params?.type || "");
  const activeType = VALID_TYPES.has(rawType) ? rawType : "";
  const page = Math.max(Number(params?.page) || 1, 1);
  const { catalog, loadError } = await getCatalog({
    page,
    type: activeType,
  });
  const films = catalog.data;
  const showingFrom = films.length > 0 ? (catalog.pagination.page - 1) * PAGE_LIMIT + 1 : 0;
  const showingTo = Math.min(catalog.pagination.page * PAGE_LIMIT, catalog.pagination.total);

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <section className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(229,9,20,0.24),transparent_30%),linear-gradient(180deg,#171717_0%,#050505_82%)] px-4 pb-8 pt-12 md:px-8 md:pb-12 md:pt-16">
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#050505] to-transparent" />

        <header className="relative mx-auto max-w-7xl">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.28em] text-red-500">
            Film terbaru
          </p>
          <div className="max-w-3xl">
            <h1 className="text-4xl font-black uppercase leading-none tracking-tight text-white md:text-7xl">
              Pilihan Film Untuk Ditonton Sekarang
            </h1>
            <p className="mt-4 max-w-2xl text-sm font-medium leading-6 text-zinc-300 md:text-base">
              Katalog film diperbarui otomatis dari server, tampil dengan nuansa gelap, poster besar, dan fokus ke tontonan.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-widest text-zinc-400">
            <span className="rounded-sm bg-red-600 px-3 py-1.5 text-white">
              {catalog.pagination.total} Judul
            </span>
            <span>{typeLabel(activeType)}</span>
            <span>Update realtime</span>
          </div>
        </header>
      </section>

      <section className="px-4 py-8 md:px-8 md:py-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-white md:text-2xl">
                Sedang Tersedia
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Menampilkan {showingFrom}-{showingTo} dari {catalog.pagination.total} judul.
              </p>
            </div>
          </div>

          <div className="mb-6">
            <CatalogFilter activeType={activeType} />
          </div>

          {loadError ? (
            <CatalogErrorState message={loadError} />
          ) : (
            <RealtimeMovieGrid
              initialMovies={films}
              page={page}
              limit={PAGE_LIMIT}
              type={activeType}
            />
          )}

          {!loadError && (
            <CatalogPagination
              pagination={catalog.pagination}
              activeType={activeType}
            />
          )}
        </div>
      </section>
    </main>
  );
}
