import Link from "next/link";

function pageHref(basePath, { page, type, query }) {
  const params = new URLSearchParams();

  if (page > 1) params.set("page", String(page));
  if (type) params.set("type", type);
  if (query) params.set("q", query);

  const suffix = params.toString();
  return suffix ? `${basePath}?${suffix}` : basePath;
}

function PageButton({ disabled, href, children }) {
  const className =
    "inline-flex min-h-10 items-center justify-center rounded-sm border px-4 text-xs font-black uppercase tracking-widest transition";

  if (disabled) {
    return (
      <span className={`${className} border-white/5 bg-zinc-950 text-zinc-700`}>
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={`${className} border-white/10 bg-zinc-950 text-zinc-300 hover:border-red-600 hover:text-white`}
    >
      {children}
    </Link>
  );
}

export default function CatalogPagination({
  pagination,
  activeType = "",
  query = "",
  basePath = "/",
}) {
  if (!pagination || pagination.totalPages <= 1) return null;

  const page = pagination.page || 1;

  return (
    <nav className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
      <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
        Halaman {page} dari {pagination.totalPages}
      </p>
      <div className="flex items-center gap-2">
        <PageButton
          disabled={!pagination.hasPrevPage}
          href={pageHref(basePath, {
            page: Math.max(page - 1, 1),
            type: activeType,
            query,
          })}
        >
          Prev
        </PageButton>
        <PageButton
          disabled={!pagination.hasNextPage}
          href={pageHref(basePath, {
            page: page + 1,
            type: activeType,
            query,
          })}
        >
          Next
        </PageButton>
      </div>
    </nav>
  );
}
