import Link from "next/link";

export default function CatalogErrorState({
  title = "Katalog belum bisa dimuat",
  message = "Ada masalah saat mengambil data. Coba muat ulang halaman ini.",
  actionHref = "/",
  actionLabel = "Muat ulang katalog",
}) {
  return (
    <div className="border border-red-900/60 bg-red-950/20 px-5 py-10 text-center text-white">
      <p className="text-lg font-black uppercase tracking-tight">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-400">
        {message}
      </p>
      <Link
        href={actionHref}
        className="mt-5 inline-flex min-h-10 items-center rounded-sm bg-red-600 px-4 text-xs font-black uppercase tracking-widest text-white hover:bg-red-500"
      >
        {actionLabel}
      </Link>
    </div>
  );
}
