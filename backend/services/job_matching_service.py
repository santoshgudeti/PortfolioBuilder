import json
from groq import AsyncGroq
from loguru import logger
from config import get_settings

settings = get_settings()

JOB_MATCHING_PROMPT = """You are an expert career matchmaker and recruiter. Analyze the career data below and return matching job opportunities.

For each job match, evaluate:
1. How well the person's skills, experience, and career level match the role
2. What skills they're missing that would strengthen their application
3. A tailored resume summary optimized for that specific role
4. Realistic job titles they should search for

Return ONLY a valid JSON object with this schema:
{
  "matches": [
    {
      "role_category": "string (e.g. 'Senior Software Engineer', 'Product Manager', 'Data Scientist')",
      "match_score": "number 0-100",
      "confidence": "high | medium | low — how confident the match is based on available data",
      "rationale": "string — why this role fits",
      "skill_gaps": ["array of skills or experience this person lacks for this role"],
      "tailored_summary": "string — a 2-3 sentence resume summary optimized for this role",
      "alternative_titles": ["array of 3-5 job titles they should search for"],
      "growth_direction": "string — what this role would add to their career trajectory"
    }
  ],
  "career_advice": "string — 2-3 sentence overall career advice based on their profile"
}

Rules:
- Base analysis strictly on provided data. Don't invent experience.
- Match scores should be realistic (70+ is strong, 50-70 is decent, below 50 is weak).
- Suggest 3-6 matches covering different paths (not all the same role type).
- Return ONLY the JSON, no other text.
"""


async def find_matching_roles(
    parsed_data: dict,
    career_graph: dict,
) -> dict:
    """Analyze career data and return matching job roles with scores and skill gaps."""
    client = AsyncGroq(api_key=settings.groq_api_key)

    context = {
        "career_graph": career_graph,
        "parsed_data": {
            "title": parsed_data.get("title", ""),
            "summary": parsed_data.get("summary", ""),
            "skills": parsed_data.get("skills", []),
            "experience": [
                {"role": e.get("role"), "company": e.get("company"), "description": e.get("description")[:200]}
                for e in parsed_data.get("experience", [])
            ],
        },
    }

    try:
        completion = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": JOB_MATCHING_PROMPT},
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

        result = json.loads(raw)
        return result

    except Exception as e:
        logger.error(f"Job matching failed: {e}")
        return {
            "matches": [],
            "career_advice": "Could not analyze career data at this time.",
        }
