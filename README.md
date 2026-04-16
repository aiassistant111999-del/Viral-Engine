# AI Content Intelligence Engine

A production-ready MVP for AI content creators to analyze viral patterns and generate high-converting video ideas and scripts.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS (v4)
- **AI**: Google Gemini 1.5 Flash (via AI Studio)
- **Data**: YouTube Data API v3

## Features
1. **Trend Analysis**: Fetches top 15 YouTube videos for any keyword from the last 30 days.
2. **Pattern Recognition**: Analyzes titles and metadata using Gemini to find viral hooks and formats.
3. **Idea Generation**: Generates 10 viral video ideas based on identified patterns.
4. **Scripting**: Generates full, high-converting video scripts for selected ideas.

## Getting Started

### 1. Prerequisites
- Node.js 18+
- [Google AI Studio API Key](https://aistudio.google.com/app/apikey)
- [YouTube Data API Key](https://console.cloud.google.com/apis/library/youtube.googleapis.com)

### 2. Setup
Clone this repository and install dependencies:
```bash
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory and add your keys:
```env
YOUTUBE_API_KEY=your_youtube_api_key
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Run the App
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the engine in action.

## Project Structure
- `src/app/api/`: Backend endpoints for search, analysis, and generation.
- `src/lib/`: Core logic for YouTube and Gemini integrations.
- `src/app/page.tsx`: Premium landing page and interactive engine.
- `src/app/globals.css`: Custom glassmorphism and animations.
