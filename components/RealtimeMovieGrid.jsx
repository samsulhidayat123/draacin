"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import DramaCard from "@/components/DramaCard";

async function fetchMovies({ page, limit, type, query }) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (type) params.set("type", type);
  if (query) params.set("q", query);

  const res = await fetch(`/api/movies?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Gagal mengambil data film");
  }

  const data = await res.json();
  return data.data || [];
}

export default function RealtimeMovieGrid({
  initialMovies,
  page = 1,
  limit = 60,
  type = "",
  query = "",
  refreshEnabled = true,
}) {
  const [movies, setMovies] = useState(initialMovies);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setMovies(initialMovies);
  }, [initialMovies]);

  useEffect(() => {
    if (!refreshEnabled) return undefined;

    const source = new EventSource("/api/movies/stream");

    const refreshMovies = async () => {
      try {
        const latestMovies = await fetchMovies({ page, limit, type, query });
        startTransition(() => {
          setMovies(latestMovies);
        });
      } catch (error) {
        console.error("Realtime refresh error:", error);
      }
    };

    source.addEventListener("movies", refreshMovies);

    source.onerror = (error) => {
      console.error("Realtime stream error:", error);
    };

    return () => {
      source.removeEventListener("movies", refreshMovies);
      source.close();
    };
  }, [page, limit, type, query, refreshEnabled]);

  if (movies.length === 0) {
    return (
      <div className="border border-white/10 bg-zinc-950 px-6 py-14 text-center text-white">
        <p className="text-lg font-black uppercase tracking-tight">
          Tidak ada judul yang cocok
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
          Coba kata kunci lain atau ubah filter tipe konten.
        </p>
        <Link
          href="/"
          className="mt-5 inline-flex rounded-sm bg-red-600 px-4 py-2 text-xs font-black uppercase tracking-widest text-white hover:bg-red-500"
        >
          Lihat semua
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {movies.map((movie, index) => (
        <DramaCard
          key={movie._id || movie.slug || movie.target_id || index}
          drama={movie}
        />
      ))}
    </div>
  );
}
