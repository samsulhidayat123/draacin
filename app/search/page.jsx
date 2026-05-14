import CatalogErrorState from "@/components/CatalogErrorState";
import CatalogFilter from "@/components/CatalogFilter";
import CatalogPagination from "@/components/CatalogPagination";
import RealtimeMovieGrid from "@/components/RealtimeMovieGrid";
import { getMoviesPage } from "@/lib/movies";

const EMPTY_CATALOG = {
  data: [],
  pagination: {
    page: 1,
    limit: 60,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  },
};

async function getSearchCatalog({ page, query, type }) {
  if (!query) return { catalog: EMPTY_CATALOG, loadError: "" };

  try {
    const catalog = await getMoviesPage({
      page,
      limit: 60,
      query,
      type,
    });

    return { catalog, loadError: "" };
  } catch (error) {
    console.error("Search error:", error.message);

    return {
      catalog: EMPTY_CATALOG,
      loadError:
        "Pencarian belum bisa mengambil data dari MongoDB. Coba ulang beberapa saat lagi.",
    };
  }
}

export default async function Search({ searchParams }) {
  const params = await searchParams;
  const query = String(params?.q || "").trim();
  const rawType = String(params?.type || "");
  const activeType = ["movie", "series", "kdrama", "anime"].includes(rawType)
    ? rawType
    : "";
  const page = Math.max(Number(params?.page) || 1, 1);
  const { catalog, loadError } = await getSearchCatalog({
    page,
    query,
    type: activeType,
  });

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-8 text-white md:px-8 md:py-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-5 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-xs font-black uppercase tracking-[0.28em] text-red-500">
              Pencarian
            </p>
            <h1 className="text-3xl font-black uppercase tracking-tight md:text-5xl">
              {query ? `Hasil untuk "${query}"` : "Cari katalog"}
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              {query
                ? `${catalog.pagination.total} judul ditemukan.`
                : "Masukkan judul dari kolom pencarian di navbar."}
            </p>
          </div>

          <CatalogFilter activeType={activeType} basePath="/search" query={query} />
        </header>

        {loadError ? (
          <CatalogErrorState
            title="Pencarian gagal dimuat"
            message={loadError}
            actionHref={query ? `/search?q=${encodeURIComponent(query)}` : "/search"}
            actionLabel="Ulangi pencarian"
          />
        ) : (
          <RealtimeMovieGrid
            initialMovies={catalog.data}
            page={page}
            limit={60}
            type={activeType}
            query={query}
            refreshEnabled={Boolean(query)}
          />
        )}

        {!loadError && (
          <CatalogPagination
            pagination={catalog.pagination}
            activeType={activeType}
            query={query}
            basePath="/search"
          />
        )}
      </div>
    </main>
  );
}
