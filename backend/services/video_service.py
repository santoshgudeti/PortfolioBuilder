import json
from groq import AsyncGroq
from loguru import logger
from config import get_settings

settings = get_settings()

SCRIPT_PROMPT = """You are a video production scriptwriter. Create a professional portfolio video script for the candidate.

Candidate Profile:
{profile}

Target Duration: {duration_seconds} seconds
Tone: {tone}

Return ONLY a valid JSON object with this schema:
{{
  "title": "video title",
  "tagline": "one-line hook/tagline for the video",
  "duration_seconds": {duration_seconds},
  "total_scenes": number,
  "scenes": [
    {{
      "scene_number": 1,
      "type": "hook | intro | experience | projects | skills | achievements | outro | cta",
      "visual_description": "detailed description of what appears on screen (background, text overlays, images, animations)",
      "narration": "the spoken narration for this scene word-for-word",
      "duration_seconds": "duration for this scene in seconds",
      "on_screen_text": "key text that appears on screen (bullet points, name, title)",
      "transition": "fade | slide | zoom | cut | dissolve",
      "music_mood": "energetic | professional | inspirational | calm | modern"
    }}
  ],
  "total_narration_words": number,
  "estimated_read_time_seconds": number,
  "suggested_background_music": "description of recommended music style",
  "production_notes": ["array of practical tips for recording/production"]
}}

Rules:
- Total scene durations should sum to approximately {duration_seconds} seconds
- Hook scene must grab attention in first 3-5 seconds
- Include 1-2 scenes showcasing key achievements with metrics
- Narration should be conversational and professional
- Visual descriptions should be specific and producible
- Include a strong call-to-action in the final scene
- For a {tone} tone, adjust language and visuals accordingly
- Return ONLY the JSON
"""


async def generate_video_script(
    duration_seconds: int,
    tone: str,
    parsed_data: dict,
    career_graph: dict,
) -> dict:
    """Generate a video portfolio script from portfolio data."""
    profile = {
        "title": parsed_data.get("title", "Professional"),
        "summary": (parsed_data.get("summary", "") or "")[:500],
        "skills": parsed_data.get("skills", [])[:10],
        "experience": [
            {
                "role": e.get("role"),
                "company": e.get("company"),
                "description": (e.get("description") or "")[:200],
            }
            for e in parsed_data.get("experience", [])[:3]
        ],
        "projects": [
            {
                "title": p.get("title"),
                "description": (p.get("description") or "")[:200],
                "tech": p.get("tech", []),
            }
            for p in parsed_data.get("projects", [])[:3]
        ],
        "achievements": (career_graph.get("achievements") if career_graph else [])[:5],
        "career_level": career_graph.get("career_level", "") if career_graph else "",
    }

    client = AsyncGroq(api_key=settings.groq_api_key)
    prompt = SCRIPT_PROMPT.format(
        profile=json.dumps(profile, indent=2),
        duration_seconds=duration_seconds,
        tone=tone,
    )

    try:
        completion = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a video scriptwriter. Output only valid JSON."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.6,
            max_tokens=3072,
        )

        raw = completion.choices[0].message.content.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
            raw = raw.strip()

        return json.loads(raw)
    except Exception as e:
        logger.error(f"Video script generation failed: {e}")
        return {"error": str(e), "scenes": []}
