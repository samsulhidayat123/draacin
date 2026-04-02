"use client";

import { useRouter } from "next/navigation";

export default function HeroBanner({ drama }) {
  const router = useRouter();

  if (!drama) return null;

  return (
    <section className="relative w-full h-[60vh] mb-10 overflow-hidden rounded-lg">

      <img
        src={drama.coverWap}
        alt={drama.bookName}
        className="absolute inset-0 w-full h-full object-cover brightness-50"
      />

      <div className="absolute bottom-10 left-10 max-w-xl">

        <h1 className="text-4xl font-bold mb-4">
          {drama.bookName}
        </h1>

        <p className="text-gray-300 text-sm mb-6">
          Drama terbaru yang sedang trending di Gerbang Cinema.
        </p>

        <button
          onClick={() => router.push(`/drama/${drama.bookId}`)}
          className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded font-semibold"
        >
          ▶ Tonton Sekarang
        </button>

      </div>

    </section>
  );
}