const API_KEY = process.env.YOUTUBE_API_KEY;

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedDate: string;
  viewCount: number;
  channelId: string;
  channelName: string;
  subscriberCount: number; // For authority weighting
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
    maxResults: "12", // Cleaned up count
    key: API_KEY,
  });

  const searchRes = await fetch(`https://www.googleapis.com/youtube/v3/search?${searchParams.toString()}`);
  if (!searchRes.ok) throw new Error("YouTube search failed");
  const searchData = await searchRes.json();
  const videos = searchData.items || [];
  const videoIds = videos.map((i: any) => i.id.videoId).join(",");
  const channelIds = videos.map((i: any) => i.snippet.channelId).join(",");

  // 2. Fetch statistics (for viewCount)
  const statsParams = new URLSearchParams({
    part: "snippet,statistics",
    id: videoIds,
    key: API_KEY,
  });

  const statsRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?${statsParams.toString()}`);
  if (!statsRes.ok) throw new Error("YouTube stats fetch failed");
  const statsData = await statsRes.json();

  // 3. Fetch Channel Statistics (for subscriberCount)
  const channelParams = new URLSearchParams({
    part: "statistics",
    id: channelIds,
    key: API_KEY,
  });
  const channelRes = await fetch(`https://www.googleapis.com/youtube/v3/channels?${channelParams.toString()}`);
  const channelData = await channelRes.json();
  
  // Map channels for quick lookup
  const channelMap = (channelData.items || []).reduce((acc: any, item: any) => {
    acc[item.id] = parseInt(item.statistics.subscriberCount) || 0;
    return acc;
  }, {});

  return (statsData.items || []).map((item: any) => ({
    id: item.id,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
    publishedDate: item.snippet.publishedAt,
    viewCount: parseInt(item.statistics.viewCount) || 0,
    channelId: item.snippet.channelId,
    channelName: item.snippet.channelTitle,
    subscriberCount: channelMap[item.snippet.channelId] || 0,
  }));
}
