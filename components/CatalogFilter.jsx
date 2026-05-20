import Link from "next/link";

export const CATALOG_FILTERS = [
  { value: "", label: "Semua" },
  { value: "movie", label: "Movie" },
  { value: "series", label: "Series" },
  { value: "kdrama", label: "Kdrama" },
  { value: "anime", label: "Anime" },
  { value: "dracin", label: "Drama China" },
  { value: "netflix", label: "Netflix" },
  { value: "film_indo", label: "Film Indo" },
];

function buildHref(basePath, { type, query }) {
  const params = new URLSearchParams();

  if (type) params.set("type", type);
  if (query) params.set("q", query);

  const suffix = params.toString();
  return suffix ? `${basePath}?${suffix}` : basePath;
}

export default function CatalogFilter({ activeType = "", basePath = "/", query = "" }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {CATALOG_FILTERS.map((filter) => {
        const active = filter.value === activeType;

        return (
          <Link
            key={filter.label}
            href={buildHref(basePath, { type: filter.value, query })}
            className={`rounded-sm border px-3 py-2 text-xs font-black uppercase tracking-widest transition ${
              active
                ? "border-red-600 bg-red-600 text-white"
                : "border-white/10 bg-zinc-950 text-zinc-400 hover:border-white/30 hover:text-white"
            }`}
          >
            {filter.label}
          </Link>
        );
      })}
    </div>
  );
}
