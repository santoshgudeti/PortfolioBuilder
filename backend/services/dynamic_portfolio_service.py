import json
from groq import AsyncGroq
from loguru import logger
from config import get_settings

settings = get_settings()

TAILOR_PROMPT = """You are a professional resume and portfolio tailor. Adapt the candidate's portfolio data for a {target_role} position.

Return ONLY valid JSON with this exact schema:
{{
  "title": "job title tailored for {target_role}",
  "summary": "250-300 character professional summary optimized for {target_role} roles",
  "skills": ["array of skills relevant to {target_role}, reordered with most relevant first"],
  "experience": [
    {{
      "role": "role title tailored for {target_role}",
      "company": "original company name",
      "description": "description rewritten to emphasize {target_role}-relevant contributions (250-300 chars)",
      "start_date": "original start date or null",
      "end_date": "original end date or null"
    }}
  ],
  "projects": [
    {{
      "title": "project name",
      "description": "description highlighting aspects relevant to {target_role} (200-250 chars)",
      "tech": ["technologies relevant to {target_role}"],
      "link": "original link or null"
    }}
  ],
  "achievements": ["3-5 key achievements rewritten for {target_role} relevance"],
  "tailoring_notes": "brief explanation of what was emphasized for this role"
}}

Candidate data:
{candidate_data}

Rules:
- Keep ALL experience entries and projects (do not remove any)
- Rewrite descriptions to highlight {target_role}-relevant aspects
- Reorder skills so the most relevant to {target_role} appear first
- Add tailoring_notes explaining what was emphasized
- Do NOT fabricate experience or companies
- Return ONLY the JSON
"""


async def generate_role_version(
    target_role: str,
    parsed_data: dict,
    career_graph: dict,
) -> dict | None:
    """Generate a role-specific version of portfolio data."""
    candidate_data = {
        "title": parsed_data.get("title", "Professional"),
        "summary": parsed_data.get("summary", ""),
        "skills": parsed_data.get("skills", []),
        "experience": [
            {
                "role": e.get("role"),
                "company": e.get("company"),
                "description": (e.get("description") or "")[:500],
                "start_date": e.get("start_date"),
                "end_date": e.get("end_date"),
            }
            for e in parsed_data.get("experience", [])
        ],
        "projects": [
            {
                "title": p.get("title"),
                "description": (p.get("description") or "")[:400],
                "tech": p.get("tech", []),
                "link": p.get("link"),
            }
            for p in parsed_data.get("projects", [])
        ],
        "career_insights": career_graph,
    }

    client = AsyncGroq(api_key=settings.groq_api_key)
    prompt = TAILOR_PROMPT.format(target_role=target_role, candidate_data=json.dumps(candidate_data, indent=2))

    try:
        completion = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a portfolio tailoring expert. Output only valid JSON."},
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

        result = json.loads(raw)
        result["_role"] = target_role
        return result
    except Exception as e:
        logger.error(f"Role version generation failed for {target_role}: {e}")
        return None
