import json
from groq import AsyncGroq
from loguru import logger
from config import get_settings

settings = get_settings()

CONTENT_TYPES = {
    "linkedin_post": "LinkedIn post",
    "twitter_thread": "Twitter/X thread (5-8 tweets)",
    "case_study": "short case study (3-4 paragraphs)",
    "newsletter_intro": "newsletter introduction",
    "blog_outline": "blog post outline with 5-7 sections",
}

TONE_OPTIONS = ["professional", "enthusiastic", "thoughtful", "conversational", "inspiring"]

GENERATE_PROMPT = """You are a content marketing expert. Based on the professional profile below, generate engaging content.

Profile:
{profile}

Content type: {content_type}
Tone: {tone}
Additional instructions: {instructions}

Return ONLY a valid JSON object with this schema:
{{
  "title": "catchy title or headline for the content",
  "content": "the full generated content with proper formatting",
  "hashtags": ["3-5 relevant hashtags"],
  "estimated_read_time_minutes": "number as string like '2'",
  "key_topics_covered": ["2-3 topics this content addresses"]
}}

Rules:
- Generate specific, personalized content based on the person's actual experience
- Include real project names, skills, and achievements from their profile
- Make it ready to publish (no placeholders or brackets)
- For LinkedIn posts: keep to 1200-1500 characters max
- For Twitter threads: each tweet under 280 chars, write as sequential tweets separated by double newlines
- For case studies: include the problem, approach, and results from their real projects
- Return ONLY the JSON
"""

REGENERATE_PROMPT = """You are a content marketing expert. The user has seen a piece of generated content and wants a revision.

Original content:
{original_content}

Feedback:
{feedback}

Profile context:
{profile}

Return ONLY a valid JSON object with this schema:
{{
  "title": "revised title",
  "content": "revised content incorporating the feedback",
  "hashtags": ["3-5 relevant hashtags"],
  "estimated_read_time_minutes": "number as string",
  "key_topics_covered": ["2-3 topics covered"]
}}

Return ONLY the JSON.
"""


def _build_profile_summary(parsed_data: dict, career_graph: dict) -> str:
    """Build a condensed profile summary for the AI prompt."""
    parts = []
    parts.append(f"Name/Role: {parsed_data.get('title', 'Professional')}")

    summary = parsed_data.get("summary", "")
    if summary:
        parts.append(f"Summary: {summary[:400]}")

    skills = parsed_data.get("skills", [])
    if skills:
        parts.append(f"Skills: {', '.join(skills[:20])}")

    exp = parsed_data.get("experience", [])
    if exp:
        exp_text = []
        for e in exp[:3]:
            desc = (e.get("description") or "")[:300]
            exp_text.append(f"- {e.get('role')} at {e.get('company')}: {desc}")
        parts.append("Experience:\n" + "\n".join(exp_text))

    projects = parsed_data.get("projects", [])
    if projects:
        proj_text = []
        for p in projects[:3]:
            desc = (p.get("description") or "")[:200]
            tech = ", ".join(p.get("tech", [])) if p.get("tech") else ""
            proj_text.append(f"- {p.get('title')} ({tech}): {desc}")
        parts.append("Projects:\n" + "\n".join(proj_text))

    if career_graph:
        cg = career_graph
        if cg.get("achievements"):
            parts.append(f"Key achievements: {', '.join(cg['achievements'][:5])}")
        if cg.get("interests"):
            parts.append(f"Interests: {', '.join(cg['interests'][:5])}")

    return "\n\n".join(parts)


async def generate_content(
    content_type: str,
    tone: str,
    instructions: str,
    parsed_data: dict,
    career_graph: dict,
) -> dict:
    """Generate content based on portfolio data."""
    if content_type not in CONTENT_TYPES:
        return {"error": f"Invalid content type. Choose from: {', '.join(CONTENT_TYPES.keys())}"}

    if tone not in TONE_OPTIONS:
        tone = "professional"

    profile_summary = _build_profile_summary(parsed_data, career_graph)
    prompt = GENERATE_PROMPT.format(
        profile=profile_summary,
        content_type=CONTENT_TYPES[content_type],
        tone=tone,
        instructions=instructions or "none",
    )

    client = AsyncGroq(api_key=settings.groq_api_key)

    try:
        completion = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a professional content writer. Output only valid JSON."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
            max_tokens=2048,
        )

        raw = completion.choices[0].message.content.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
            raw = raw.strip()

        result = json.loads(raw)
        result["content_type"] = content_type
        result["tone"] = tone
        return result
    except Exception as e:
        logger.error(f"Content generation failed: {e}")
        return {
            "error": f"Generation failed: {str(e)}",
            "title": "",
            "content": "",
            "hashtags": [],
            "estimated_read_time_minutes": "0",
            "key_topics_covered": [],
        }


async def regenerate_content(
    original_content: str,
    feedback: str,
    parsed_data: dict,
    career_graph: dict,
) -> dict:
    """Regenerate content based on user feedback."""
    profile_summary = _build_profile_summary(parsed_data, career_graph)
    prompt = REGENERATE_PROMPT.format(
        original_content=original_content,
        feedback=feedback,
        profile=profile_summary,
    )

    client = AsyncGroq(api_key=settings.groq_api_key)

    try:
        completion = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a professional content writer. Output only valid JSON."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
            max_tokens=2048,
        )

        raw = completion.choices[0].message.content.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
            raw = raw.strip()

        return json.loads(raw)
    except Exception as e:
        logger.error(f"Content regeneration failed: {e}")
        return {
            "error": f"Regeneration failed: {str(e)}",
            "title": "",
            "content": "",
            "hashtags": [],
            "estimated_read_time_minutes": "0",
            "key_topics_covered": [],
        }
