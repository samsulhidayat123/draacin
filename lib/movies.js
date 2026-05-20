import { getMongoClient } from "@/lib/mongodb";

const DB_NAME = process.env.MONGODB_DB;
const COLLECTION_NAME = process.env.MONGODB_COLLECTION || "movies";

function serializeMovie(movie) {
  return JSON.parse(JSON.stringify(movie));
}

function clampLimit(limit) {
  const value = Number(limit);
  if (!Number.isFinite(value)) return 60;
  return Math.min(Math.max(Math.floor(value), 1), 120);
}

function pageFilter({ query, type } = {}) {
  const filter = {};

  if (type && ["movie", "series", "kdrama", "anime", "dracin", "netflix", "film_indo"].includes(type)) {
    filter.type = type;
  }

  if (query) {
    const keyword = query.trim();
    if (keyword) {
      filter.$or = [
        { title: { $regex: keyword, $options: "i" } },
        { slug: { $regex: keyword, $options: "i" } },
        { tags: { $regex: keyword, $options: "i" } },
        { genres: { $regex: keyword, $options: "i" } },
      ];
    }
  }

  return filter;
}

export async function getMovies() {
  const client = await getMongoClient();
  const movies = await client
    .db(DB_NAME)
    .collection(COLLECTION_NAME)
    .find({})
    .sort({ createdAt: -1, releaseDate: -1, _id: -1 })
    .toArray();

  return movies.map(serializeMovie);
}

export async function getMoviesPage(options = {}) {
  const page = Math.max(Number(options.page) || 1, 1);
  const limit = clampLimit(options.limit);
  const skip = (page - 1) * limit;
  const filter = pageFilter(options);
  const client = await getMongoClient();
  const collection = client.db(DB_NAME).collection(COLLECTION_NAME);
  const [movies, total] = await Promise.all([
    collection
      .find(filter)
      .sort({ createdAt: -1, releaseDate: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
    collection.countDocuments(filter),
  ]);

  return {
    data: movies.map(serializeMovie),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
      hasNextPage: skip + movies.length < total,
      hasPrevPage: page > 1,
    },
  };
}

export async function searchMovies(query) {
  if (!query) return [];

  const keyword = query.trim();
  if (!keyword) return [];

  const client = await getMongoClient();
  const movies = await client
    .db(DB_NAME)
    .collection(COLLECTION_NAME)
    .find({
      $or: [
        { title: { $regex: keyword, $options: "i" } },
        { slug: { $regex: keyword, $options: "i" } },
        { tags: { $regex: keyword, $options: "i" } },
      ],
    })
    .sort({ createdAt: -1, releaseDate: -1, _id: -1 })
    .toArray();

  return movies.map(serializeMovie);
}

export async function getMovieBySlug(slug) {
  if (!slug) return null;

  const client = await getMongoClient();
  const movie = await client
    .db(DB_NAME)
    .collection(COLLECTION_NAME)
    .findOne({ slug });

  return movie ? serializeMovie(movie) : null;
}

export async function getContentBySlugAndType(slug, type) {
  if (!slug || !type) return null;

  const client = await getMongoClient();
  const movie = await client
    .db(DB_NAME)
    .collection(COLLECTION_NAME)
    .findOne({ slug, type });

  return movie ? serializeMovie(movie) : null;
}

export async function getContentByTargetIdAndType(targetId, type) {
  if (!targetId || !type) return null;

  const client = await getMongoClient();
  const movie = await client
    .db(DB_NAME)
    .collection(COLLECTION_NAME)
    .findOne({
      type,
      $or: [
        { target_id: targetId },
        { target_id: Number(targetId) },
        { id: targetId },
        { id: Number(targetId) },
      ],
    });

  return movie ? serializeMovie(movie) : null;
}

export async function getMovieByTargetId(targetId) {
  if (!targetId) return null;

  const client = await getMongoClient();
  const movie = await client
    .db(DB_NAME)
    .collection(COLLECTION_NAME)
    .findOne({
      $or: [
        { target_id: targetId },
        { target_id: Number(targetId) },
        { id: targetId },
        { id: Number(targetId) },
      ],
    });

  return movie ? serializeMovie(movie) : null;
}

export async function updateMoviePlaybackByTargetId(targetId, playback) {
  if (!targetId) return null;

  const client = await getMongoClient();
  const result = await client
    .db(DB_NAME)
    .collection(COLLECTION_NAME)
    .findOneAndUpdate(
      {
        type: "movie",
        $or: [
          { target_id: targetId },
          { target_id: Number(targetId) },
          { id: targetId },
          { id: Number(targetId) },
        ],
      },
      {
        $set: {
          playable: playback.playable,
          playbackStatus: playback.playbackStatus,
          playbackServers: playback.playbackServers || [],
          playbackSourceUrl: playback.sourceUrl || null,
          lastCheckedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

  return result ? serializeMovie(result) : null;
}
