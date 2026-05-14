"use client";

import { useEffect } from "react";

export default function ErrorPage({ error, unstable_retry }) {
  useEffect(() => {
    console.error("App error boundary:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050505] px-4 py-12 text-center text-white">
      <div className="max-w-md border border-red-900/60 bg-red-950/20 p-8">
        <p className="mb-3 text-xs font-black uppercase tracking-[0.28em] text-red-500">
          Error
        </p>
        <h1 className="text-3xl font-black uppercase tracking-tight">
          Halaman gagal dimuat
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          Koneksi data sedang bermasalah. Coba lagi tanpa meninggalkan halaman ini.
        </p>
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="mt-6 min-h-10 rounded-sm bg-red-600 px-5 text-xs font-black uppercase tracking-widest text-white hover:bg-red-500"
        >
          Coba lagi
        </button>
      </div>
    </main>
  );
}
