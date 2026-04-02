// components/DramaCard.jsx

import Link from "next/link";
import Image from "next/image";

export default function DramaCard({ drama }) {

  const poster = drama.coverWap || "/placeholder.jpg";
  const title = drama.bookName || "Untitled Drama";

  return (
    <Link href={`/drama/${drama.bookId}`} className="group block">
      
      <div className="relative overflow-hidden rounded-md bg-[#181818] transition-all duration-300 hover:scale-105 hover:z-10 shadow-lg">

        {/* Poster */}
        <div className="relative aspect-[2/3] w-full">

          <Image
            src={poster}
            alt={title}
            fill
            sizes="(max-width:768px) 50vw, 20vw"
            className="object-cover transition duration-500 group-hover:brightness-110"
            priority={false}
          />

          {/* Episode Tag */}
          {drama.chapterCount && (
            <span className="absolute bottom-2 left-2 rounded-sm bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white shadow">
              {drama.chapterCount} Eps
            </span>
          )}

        </div>

        {/* Info */}
        <div className="p-2">
          
          <h3 className="line-clamp-1 text-xs md:text-sm font-semibold text-white group-hover:text-red-500 transition-colors">
            {title}
          </h3>

          <p className="text-[10px] text-gray-400 mt-1">
            {drama.tags?.[0] || "Drama"}
          </p>

        </div>

      </div>

    </Link>
  );
}