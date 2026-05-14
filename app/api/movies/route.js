import { getMoviesPage } from "@/lib/movies";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const result = await getMoviesPage({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      type: searchParams.get("type"),
      query: searchParams.get("q"),
    });

    return Response.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("MongoDB movies API error:", error);

    return Response.json(
      {
        success: false,
        data: [],
        message: error.message,
      },
      { status: 500 }
    );
  }
}
