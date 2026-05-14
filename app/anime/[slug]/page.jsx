import Link from "next/link";
import ContentDetail from "@/components/ContentDetail";
import { getContentBySlugAndType } from "@/lib/movies";

export default async function AnimeDetail({ params }) {
  const { slug } = await params;
  const item = await getContentBySlugAndType(slug, "anime").catch((error) => {
    console.error("Fetch anime from MongoDB error:", error.message);
    return null;
  });

  if (!item) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-black p-6 text-center text-white">
        <h1 className="mb-3 text-3xl font-black uppercase">Anime tidak ditemukan</h1>
        <p className="mb-8 max-w-md text-sm text-gray-400">
          Data anime belum tersedia dari MongoDB Atlas.
        </p>
        <Link
          href="/"
          className="rounded-sm bg-red-600 px-6 py-3 text-sm font-bold uppercase tracking-widest text-white hover:bg-red-500"
        >
          Kembali
        </Link>
      </main>
    );
  }

  return <ContentDetail item={item} expectedType="anime" />;
}
