export interface RedditPost {
  title: string;
  score: number;
  numComments: number;
  url: string;
}

/**
 * Step 1: Authenticate with Reddit using Client Credentials Grant
 * This gives us an access token to make API requests without being rate-limited.
 */
async function getRedditAccessToken(): Promise<string> {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;

  if (!clientId || !clientSecret || clientId === "[ADD_YOUR_CLIENT_ID]") {
    console.warn("Reddit API keys missing. Returning empty data.");
    return "";
  }

  const tokenUrl = "https://www.reddit.com/api/v1/access_token";
  
  // Basic Auth header requires base64 encoded "client_id:client_secret"
  const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  try {
    const res = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${authHeader}`,
        "Content-Type": "application/x-www-form-urlencoded",
        // Reddit requires a custom User-Agent to avoid generic blocks
        "User-Agent": "ViralEngine/1.0.0 by YourUsername", 
      },
      // grant_type=client_credentials is used for script apps
      body: "grant_type=client_credentials"
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error);
    
    return data.access_token;
  } catch (error) {
    console.error("Failed to authenticate Reddit:", error);
    return "";
  }
}

/**
 * Step 2: Fetch the top posts from a specific subreddit
 * We use 'hot' or 'top' to grab what people are actively desperate about.
 */
export async function getTopSubredditData(subreddit: string, limit: number = 5): Promise<RedditPost[]> {
  const token = await getRedditAccessToken();
  if (!token) return [];

  try {
    // We are looking for the 'hot' posts of the week to extract immediate pain points
    const apiUrl = `https://oauth.reddit.com/r/${subreddit}/hot?limit=${limit}`;
    
    const res = await fetch(apiUrl, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "User-Agent": "ViralEngine/1.0.0 by YourUsername",
      }
    });

    const data = await res.json();
    
    // Map the complex Reddit JSON into our clean interface
    if (data.data && data.data.children) {
      return data.data.children.map((child: any) => ({
        title: child.data.title,
        score: child.data.score,
        numComments: child.data.num_comments,
        url: `https://reddit.com${child.data.permalink}`
      }));
    }
    
    return [];
  } catch (error) {
    console.error(`Failed to fetch Reddit data for r/${subreddit}:`, error);
    return [];
  }
}

/**
 * Step 3: Pain Point Extraction (The magic layer)
 * Maps vague YouTube niches to specific hyper-active subreddits.
 */
export async function extractPainPoints(niche: string): Promise<string[]> {
  // Simple heuristic router. We map standard niches to Reddit communities.
  const lowerNiche = niche.toLowerCase();
  let subreddits = ["askreddit"]; // Default fallback

  if (lowerNiche.includes("ai") || lowerNiche.includes("tech")) {
    subreddits = ["singularity", "artificial", "ChatGPT"];
  } else if (lowerNiche.includes("fit") || lowerNiche.includes("gym")) {
    subreddits = ["Fitness", "weightroom", "bodyweightfitness"];
  } else if (lowerNiche.includes("finance") || lowerNiche.includes("money")) {
    subreddits = ["personalfinance", "Entrepreneur", "SideProject"];
  }

  // Fetch exactly 3 top threads from the main subreddit to find out what people are arguing/complaining about.
  const posts = await getTopSubredditData(subreddits[0], 3);
  
  return posts.map(p => p.title);
}
