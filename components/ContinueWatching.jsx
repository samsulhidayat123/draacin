"use client";

import { useSyncExternalStore } from "react";
import DramaCard from "./DramaCard";

const EMPTY_HISTORY = [];

function subscribeToHistory(callback) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getHistorySnapshot() {
  try {
    return JSON.parse(localStorage.getItem("watchHistory") || "[]");
  } catch {
    return EMPTY_HISTORY;
  }
}

export default function ContinueWatching() {
  const history = useSyncExternalStore(
    subscribeToHistory,
    getHistorySnapshot,
    () => EMPTY_HISTORY
  );

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
