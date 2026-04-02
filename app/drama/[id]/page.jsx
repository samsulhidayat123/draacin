// app/drama/[id]/page.jsx
import Link from "next/link";

const BASE_URL = "https://dramabox.sansekai.my.id/api/dramabox";

async function getDramaDetail(id) {
  const endpoints = [
    `${BASE_URL}/detail?bookId=${id}`,
    `${BASE_URL}/list`,
    `${BASE_URL}/trending`,
    `${BASE_URL}/home`,
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0",
          Referer: "https://dramabox.sansekai.my.id/",
          Accept: "application/json",
        },
        next: { revalidate: 3600 },
      });

      if (!res.ok) continue;

      const result = await res.json();
      if (!result) continue;

      // jika endpoint detail langsung return object
      if (!Array.isArray(result) && result.bookId) {
        if (String(result.bookId) === String(id)) {
          return result;
        }
      }

      let list = [];

      if (Array.isArray(result)) {
        list = result;
      } else if (Array.isArray(result.data)) {
        list = result.data;
      } else if (Array.isArray(result.data?.list)) {
        list = result.data.list;
      } else if (Array.isArray(result.items)) {
        list = result.items;
      } else if (Array.isArray(result.list)) {
        list = result.list;
      }

      const found = list.find(
        (item) => String(item.bookId) === String(id)
      );

      if (found) return found;
    } catch (err) {
      console.warn(`[getDramaDetail] Skip ${url}:`, err.message);
    }
  }

  console.error(`[getDramaDetail] Semua endpoint gagal untuk id=${id}`);
  return null;
}

export default async function DramaDetail({ params }) {

  // ⚠️ wajib untuk Next.js 16
  const { id } = await params;

  const drama = await getDramaDetail(id);

  if (!drama) {
    return (
      <div className="min-h-screen bg-[#141414] text-white flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-4xl font-black mb-2 uppercase tracking-tighter">
          Film Tidak Ditemukan
        </h2>
        <p className="text-gray-400 mb-2 max-w-md italic">
          Link kadaluarsa atau ID film tidak tersedia.
        </p>
        <p className="text-gray-600 mb-8 text-sm font-mono">
          ID: {id}
        </p>

        <Link
          href="/"
          className="bg-red-600 text-white px-10 py-3 rounded-sm font-black uppercase tracking-widest hover:bg-red-500 transition-all"
        >
          Kembali ke Katalog
        </Link>
      </div>
    );
  }

  const releaseDate = drama.shelfTime
    ? new Date(drama.shelfTime).getFullYear()
    : "2026";

  return (
    <main className="min-h-screen bg-[#141414] text-white p-4 md:p-12">
      <div className="mx-auto max-w-6xl">

        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-10 text-gray-500 hover:text-white transition-colors font-bold uppercase text-xs tracking-widest group"
        >
          <span className="text-xl group-hover:-translate-x-2 transition-transform">
            ←
          </span>
          <span>Back to Home</span>
        </Link>

        <div className="relative bg-[#181818] rounded-3xl overflow-hidden border border-gray-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">

          <div className="flex flex-col md:flex-row">

            <div className="w-full md:w-[380px] shrink-0 p-8">
              <div className="aspect-[2/3] w-full rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                <img
                  src={drama.coverWap || "/placeholder.png"}
                  alt={drama.bookName}
                  className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-700"
                />
              </div>
            </div>

            <div className="flex-1 p-8 md:p-12 md:pl-0 flex flex-col justify-center">

              <div className="flex items-center gap-3 mb-4">
                <span className="bg-red-600 text-white px-2 py-0.5 rounded-sm text-[10px] font-black">
                  NEW
                </span>

                {drama.rankVo?.hotCode && (
                  <span className="text-yellow-500 font-bold text-sm">
                    🔥 {drama.rankVo.hotCode}
                  </span>
                )}

                <span className="text-gray-500 text-sm">
                  {releaseDate}
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter uppercase leading-[0.95]">
                {drama.bookName}
              </h1>

              <div className="flex flex-wrap gap-2 mb-8">
                <span className="border-2 border-gray-600 text-gray-300 px-3 py-1 rounded-sm text-xs font-black uppercase">
                  {drama.chapterCount} Episodes
                </span>

                {drama.tags?.map((tag, i) => (
                  <span
                    key={i}
                    className="bg-gray-800/50 px-3 py-1 rounded-sm text-[11px] font-bold text-gray-400 border border-gray-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <p className="text-gray-300 leading-relaxed text-base md:text-lg font-medium max-w-2xl">
                {drama.introduction}
              </p>

            </div>

          </div>
        </div>

        {/* Episode List */}
        <div className="mt-20 mb-32">

          <h2 className="text-3xl font-black mb-10 uppercase">
            Pilih Episode
          </h2>

          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-3">
            {[...Array(drama.chapterCount || 0)].map((_, i) => (
              <Link
                key={i}
                href={`/watch/${id}/${i + 1}`}
                className="aspect-video bg-[#181818] border border-gray-800 hover:border-red-600 flex items-center justify-center font-black"
              >
                {i + 1}
              </Link>
            ))}
          </div>

        </div>

      </div>
    </main>
  );
}