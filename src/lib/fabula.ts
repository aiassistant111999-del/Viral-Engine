import { callGeminiResilient } from "./gemini";

export async function generateFabula({
  topic,
  platform,
  tone,
}: {
  topic: string;
  platform: string;
  tone: string;
}) {
  const prompt = `
    You are FABULA ENGINE.
    Your job is to convert a topic into a viral story system.

    Topic: ${topic}
    Platform: ${platform}
    Tone: ${tone}

    OUTPUT STRICT JSON:
    {
      "core_story": "",
      "emotional_trigger": "",
      "curiosity_gap": "",
      "narrative_flow": [
        "Scene 1",
        "Scene 2",
        "Scene 3",
        "Scene 4"
      ],
      "scene_details": [
        {
          "scene": "Scene Name",
          "visual": "Visual description for the editor/camera",
          "voiceover": "Script for the narrator"
        }
      ]
    }

    Rules:
    - Must feel like viral content
    - Strong emotional trigger (fear, curiosity, status, money)
    - Scenes must escalate tension
    - No generic storytelling
  `;

  try {
    const result = await callGeminiResilient(prompt);
    const text = result.response.text();
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch (err: any) {
    console.error("Fabula generation error inside lib:", err);
    throw new Error(err.message || "Failed to generate Fabula");
  }
}

