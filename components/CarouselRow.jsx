"use client";

import DramaCard from "./DramaCard";

export default function CarouselRow({ title, dramas }) {

  return (
    <section className="mb-10">

      <h2 className="text-xl font-semibold mb-4">
        {title}
      </h2>

      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">

        {dramas.map((drama, index) => (
          <div key={index} className="min-w-[150px]">
            <DramaCard drama={drama} />
          </div>
        ))}

      </div>

    </section>
  );
}