import EpisodePlayerPage from "@/components/EpisodePlayerPage";

export default async function SeriesWatchPage({ params }) {
  const { id, season, episode } = await params;

  return (
    <EpisodePlayerPage
      type="series"
      id={id}
      season={season}
      episode={episode}
    />
  );
}
