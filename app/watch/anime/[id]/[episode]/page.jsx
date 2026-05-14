import EpisodePlayerPage from "@/components/EpisodePlayerPage";

export default async function AnimeWatchPage({ params }) {
  const { id, episode } = await params;

  return (
    <EpisodePlayerPage
      type="anime"
      id={id}
      episode={episode}
    />
  );
}
