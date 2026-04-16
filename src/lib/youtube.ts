const API_KEY = process.env.YOUTUBE_API_KEY;

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedDate: string; // Renamed to match route.ts expectation
  viewCount: number;
}

export async function searchTopVideos(keyword: string): Promise<YouTubeVideo[]> {
  if (!API_KEY) {
    throw new Error("Missing YOUTUBE_API_KEY");
  }

  // 1. Search for videos
  const searchParams = new URLSearchParams({
    part: "snippet",
    q: keyword,
    type: "video",
    order: "viewCount",
    maxResults: "15",
    key: API_KEY,
  });

  const searchRes = await fetch(`https://www.googleapis.com/youtube/v3/search?${searchParams.toString()}`);
  if (!searchRes.ok) throw new Error("YouTube search failed");
  const searchData = await searchRes.json();
  const videoIds = searchData.items.map((i: any) => i.id.videoId).join(",");

  // 2. Fetch statistics (for viewCount)
  const statsParams = new URLSearchParams({
    part: "snippet,statistics",
    id: videoIds,
    key: API_KEY,
  });

  const statsRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?${statsParams.toString()}`);
  if (!statsRes.ok) throw new Error("YouTube stats fetch failed");
  const statsData = await statsRes.json();

  return (statsData.items || []).map((item: any) => ({
    id: item.id,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
    publishedDate: item.snippet.publishedAt,
    viewCount: parseInt(item.statistics.viewCount) || 0,
  }));
}
