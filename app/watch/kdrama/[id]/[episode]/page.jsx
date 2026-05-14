import EpisodePlayerPage from "@/components/EpisodePlayerPage";

export default async function KdramaWatchPage({ params }) {
  const { id, episode } = await params;

  return (
    <EpisodePlayerPage
      type="kdrama"
      id={id}
      episode={episode}
    />
  );
}
