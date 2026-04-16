import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get("keyword");
  const API_KEY = process.env.YOUTUBE_API_KEY;

  if (!keyword) {
    return NextResponse.json({ error: "Keyword query parameter is required" }, { status: 400 });
  }

  if (!API_KEY) {
    return NextResponse.json({ error: "YOUTUBE_API_KEY is not configured" }, { status: 500 });
  }

  try {
    // Step 1: Search for videos to get IDs
    const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
    searchUrl.searchParams.append("part", "snippet");
    searchUrl.searchParams.append("q", keyword);
    searchUrl.searchParams.append("type", "video");
    searchUrl.searchParams.append("maxResults", "15");
    searchUrl.searchParams.append("order", "relevance"); // relevance is primary per user request
    searchUrl.searchParams.append("key", API_KEY);

    const searchResponse = await fetch(searchUrl.toString());
    const searchData = await searchResponse.json();

    if (!searchResponse.ok) {
      throw new Error(searchData.error?.message || "YouTube search failed");
    }

    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(",");

    // Step 2: Fetch detailed statistics (viewCount) for those IDs
    const statsUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
    statsUrl.searchParams.append("part", "snippet,statistics");
    statsUrl.searchParams.append("id", videoIds);
    statsUrl.searchParams.append("key", API_KEY);

    const statsResponse = await fetch(statsUrl.toString());
    const statsData = await statsResponse.json();

    if (!statsResponse.ok) {
      throw new Error(statsData.error?.message || "YouTube statistics fetch failed");
    }

    // Format results
    const results = statsData.items.map((meta: any) => ({
      id: meta.id,
      title: meta.snippet.title,
      channelName: meta.snippet.channelTitle,
      viewCount: parseInt(meta.statistics.viewCount || "0"),
      publishedDate: meta.snippet.publishedAt,
      thumbnail: meta.snippet.thumbnails?.high?.url || meta.snippet.thumbnails?.default?.url,
    }));

    return NextResponse.json(results);
  } catch (error: any) {
    console.error("YouTube API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
