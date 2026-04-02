"use client";

import { useEffect, useState } from "react";
import DramaCard from "./DramaCard";

export default function ContinueWatching() {

  const [history, setHistory] = useState([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("watchHistory") || "[]");
    setHistory(data);
  }, []);

  if (history.length === 0) return null;

  return (
    <section className="mb-10">

      <h2 className="text-xl font-semibold mb-4">
        Lanjut Menonton
      </h2>

      <div className="flex gap-4 overflow-x-auto">

        {history.map((drama, index) => (
          <div key={index} className="min-w-[150px]">
            <DramaCard drama={drama} />
          </div>
        ))}

      </div>

    </section>
  );
}