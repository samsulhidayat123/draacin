import { checkIdflixMoviePlayback } from "@/lib/idflixPlayback";
import { updateMoviePlaybackByTargetId } from "@/lib/movies";

export const dynamic = "force-dynamic";

export async function POST(_request, { params }) {
  const { id } = await params;

  try {
    const playback = await checkIdflixMoviePlayback(id);
    const movie = await updateMoviePlaybackByTargetId(id, playback);

    if (!movie) {
      return Response.json(
        {
          success: false,
          message: "Film tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      data: {
        target_id: movie.target_id,
        playable: movie.playable,
        playbackStatus: movie.playbackStatus,
        playbackServers: movie.playbackServers || [],
        lastCheckedAt: movie.lastCheckedAt,
      },
    });
  } catch (error) {
    console.error("Playback refresh error:", error);

    return Response.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}
