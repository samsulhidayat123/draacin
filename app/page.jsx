// app/page.jsx
import DramaCard from '@/components/DramaCard';

// Fungsi untuk mengambil data dari API Sansekai
async function getLatestDramas() {
  try {
    const res = await fetch('https://dramabox.sansekai.my.id/api/dramabox/latest', {
      next: { revalidate: 3600 } // Cache selama 1 jam biar website tetap ngebut
    });

    if (!res.ok) {
      throw new Error('Gagal mengambil data dari API');
    }

    const data = await res.json();
    return data || []; 

  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
}

export default async function Home() {
  const dramas = await getLatestDramas();

  return (
    <main className="min-h-screen bg-black p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        
        {/* Header Gerbang Cinema */}
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500 tracking-tight">
              Gerbang Cinema
            </h1>
            <p className="text-gray-400 mt-2 text-sm font-medium">
              Portal Drama & Film Terbaru
            </p>
          </div>
        </header>

        {/* Grid Card Film */}
        {dramas.length === 0 ? (
          <div className="text-center text-white p-10 bg-gray-900 rounded-lg border border-gray-800">
            <p>Belum ada film yang tayang. Coba refresh lagi nanti atau periksa koneksi internetmu.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {dramas.map((drama, index) => (
              <DramaCard key={drama.bookId || index} drama={drama} />
            ))}
          </div>
        )}

      </div>
    </main>
  );
}