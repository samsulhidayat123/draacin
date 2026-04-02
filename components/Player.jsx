"use client";

export default function Player({ url }) {

  return (
    <div className="w-full max-w-6xl mx-auto aspect-video bg-black rounded-lg overflow-hidden shadow-xl">

      <iframe
        src={url}
        className="w-full h-full"
        allowFullScreen
      />

    </div>
  );
}