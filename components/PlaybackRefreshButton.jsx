"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function PlaybackRefreshButton({ targetId }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  const refreshPlayback = async () => {
    if (!targetId) return;

    setMessage("");

    try {
      const response = await fetch(`/api/movies/${targetId}/playback`, {
        method: "POST",
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        setMessage(result.message || "Gagal check player.");
        return;
      }

      setMessage(
        result.data.playable
          ? `Player aktif: ${result.data.playbackServers.length} server`
          : `Status: ${result.data.playbackStatus}`
      );

      startTransition(() => {
        router.refresh();
      });
    } catch {
      setMessage("Gagal menghubungi server.");
    }
  };

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={refreshPlayback}
        disabled={isPending}
        className="rounded-sm border border-zinc-700 px-4 py-2 text-xs font-black uppercase tracking-widest text-zinc-200 transition hover:border-red-600 hover:text-white disabled:cursor-wait disabled:opacity-60"
      >
        {isPending ? "Checking..." : "Check ulang player"}
      </button>
      {message && <p className="text-xs font-semibold text-zinc-500">{message}</p>}
    </div>
  );
}
