import json
from groq import AsyncGroq
from loguru import logger
from config import get_settings

settings = get_settings()

ACHIEVEMENT_PROMPT = """You are a resume achievement analyst. Your job is to take vague experience or project descriptions and suggest metric-enriched versions that better communicate impact.

For each entry, analyze:
1. What is the person actually describing?
2. What metrics can be reasonably inferred from the context (role, industry, team size, technology)?
3. Rewrite the description to include concrete numbers, percentages, timeframes, or scale.

Rules:
- NEVER fabricate numbers without good contextual basis. If you're guessing, use ranges ("40-60%") or flag as inferred.
- If the original already has good metrics, note that it's already strong.
- Keep the rewritten version concise (1-2 sentences).
- Return ONLY the JSON with no explanation.

Analyze these items and return a JSON array. Each element in the array must be:
{
  "type": "experience" or "project",
  "index": "number index of the item in the original array",
  "title": "the role title or project name",
  "original": "the original description text",
  "suggested": "the rewritten version with inferred metrics",
  "confidence": "high" if metrics are well-supported, "medium" if partially inferred, "low" if mostly guessed,
  "rationale": "brief explanation of what metrics were added and why"
}
"""


async def discover_achievements(
    parsed_data: dict,
    career_graph: dict,
) -> list[dict]:
    """Analyze experience and project descriptions and suggest metric-enriched versions."""
    items_to_analyze = []

    for i, exp in enumerate(parsed_data.get("experience", [])):
        if exp.get("description") and len(exp["description"]) > 10:
            items_to_analyze.append({
                "type": "experience",
                "index": i,
                "title": f"{exp.get('role', 'Unknown Role')} at {exp.get('company', 'Unknown Company')}",
                "original": exp["description"],
            })

    for i, proj in enumerate(parsed_data.get("projects", [])):
        if proj.get("description") and len(proj["description"]) > 10:
            items_to_analyze.append({
                "type": "project",
                "index": i,
                "title": proj.get("title", "Unknown Project"),
                "original": proj["description"],
            })

    if not items_to_analyze:
        return []

    context = {
        "career_graph": career_graph,
        "items": items_to_analyze,
    }

    client = AsyncGroq(api_key=settings.groq_api_key)

    try:
        completion = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": ACHIEVEMENT_PROMPT},
                {"role": "user", "content": json.dumps(context, indent=2)},
            ],
            temperature=0.4,
            max_tokens=2048,
        )

        raw = completion.choices[0].message.content.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
            raw = raw.strip()

        results = json.loads(raw)
        if isinstance(results, list):
            return results
        return []

    except Exception as e:
        logger.error(f"Achievement discovery failed: {e}")
        return []
