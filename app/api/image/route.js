import { ALLOWED_POSTER_HOSTS } from "@/lib/poster";

export const dynamic = "force-dynamic";

const CACHE_SECONDS = 60 * 60 * 24;

function isAllowedImageUrl(value) {
  try {
    const url = new URL(value);
    return (
      ["http:", "https:"].includes(url.protocol) &&
      ALLOWED_POSTER_HOSTS.has(url.hostname)
    );
  } catch {
    return false;
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get("url");

  if (!imageUrl || !isAllowedImageUrl(imageUrl)) {
    return Response.json(
      { success: false, message: "Image URL tidak diizinkan." },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(imageUrl, {
      cache: "force-cache",
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      },
    });

    if (!response.ok) {
      return Response.json(
        { success: false, message: "Gagal mengambil image." },
        { status: response.status }
      );
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    if (!contentType.startsWith("image/")) {
      return Response.json(
        { success: false, message: "Response bukan image." },
        { status: 415 }
      );
    }

    return new Response(response.body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": `public, max-age=${CACHE_SECONDS}, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=${CACHE_SECONDS}`,
      },
    });
  } catch (error) {
    console.error("Image proxy error:", error);

    return Response.json(
      { success: false, message: "Image proxy error." },
      { status: 502 }
    );
  }
}
