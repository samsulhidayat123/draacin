const DETAIL_ROUTES = {
  anime: "anime",
  kdrama: "kdrama",
  movie: "movie",
  series: "series",
};

export function getContentType(item) {
  const type = String(item?.type || "movie").toLowerCase();
  return DETAIL_ROUTES[type] ? type : "movie";
}

export function getContentHref(item) {
  if (item?.bookId) return `/drama/${item.bookId}`;

  const type = getContentType(item);
  const slug = item?.slug || item?.id || item?.target_id;

  return `/${DETAIL_ROUTES[type]}/${slug}`;
}

export function getTypeLabel(type) {
  const labels = {
    anime: "Anime",
    kdrama: "Kdrama",
    movie: "Movie",
    series: "Series",
  };

  return labels[getContentType({ type })] || "Movie";
}
