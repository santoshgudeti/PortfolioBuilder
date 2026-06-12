import json
from groq import AsyncGroq
from loguru import logger
from config import get_settings

settings = get_settings()

OPTIMIZER_PROMPT = """You are an expert ATS (Applicant Tracking System) and resume optimization consultant. Analyze the resume data below and return a detailed scorecard.

Return ONLY a valid JSON object with exactly this schema (no markdown, no explanation):
{
  "overall_score": "number (0-100)",
  "breakdown": {
    "ats_compatibility": "number (0-100) — how well the resume would parse in standard ATS systems (format, section headers, contact info clarity)",
    "impact_metrics": "number (0-100) — how many achievements are quantified with numbers, percentages, or concrete outcomes",
    "action_verbs": "number (0-100) — strength of action verbs used (led, built, drove, optimized vs. responsible for, worked on)",
    "keyword_optimization": "number (0-100) — how well industry-relevant keywords and skills are integrated into experience descriptions",
    "length_structure": "number (0-100) — appropriate length, clear section hierarchy, whitespace, readability"
  },
  "strengths": ["array of 2-3 specific strengths found in the resume"],
  "suggestions": [
    {
      "category": "impact_metrics | action_verbs | keywords | ats | structure",
      "priority": "high | medium | low",
      "title": "short title of the suggestion",
      "detail": "specific actionable suggestion with example"
    }
  ],
  "missing_keywords": ["array of relevant keywords/skills that appear to be missing based on their role and industry"],
  "ats_issues": ["array of specific ATS compatibility issues detected"],
  "score_summary": "one-line summary of the score (e.g. 'Strong resume with room for more quantified impact')"
}

Rules:
- Be honest and constructive. Don't inflate scores.
- Base the analysis strictly on what's present in the data.
- Infer industry from job titles and company names.
- For missing_keywords, only suggest truly relevant ones based on their roles.
- Return ONLY the JSON, no other text.
"""


async def analyze_resume(
    parsed_data: dict,
    career_graph: dict,
    resume_text: str = "",
) -> dict:
    """Analyze resume quality and return ATS scorecard with suggestions."""
    client = AsyncGroq(api_key=settings.groq_api_key)

    context = {
        "parsed_data": parsed_data,
        "career_graph": career_graph,
        "raw_text_sample": resume_text[:2000] if resume_text else "",
    }

    try:
        completion = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": OPTIMIZER_PROMPT},
                {"role": "user", "content": f"Analyze this resume:\n\n{json.dumps(context, indent=2)}"},
            ],
            temperature=0.3,
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
        logger.error(f"Resume analysis failed: {e}")
        return {
            "overall_score": 0,
            "breakdown": {},
            "strengths": [],
            "suggestions": [{
                "category": "ats",
                "priority": "high",
                "title": "Analysis unavailable",
                "detail": f"AI analysis failed: {str(e)}. Please try again.",
            }],
            "missing_keywords": [],
            "ats_issues": ["Analysis unavailable"],
            "score_summary": "Could not analyze resume at this time.",
        }
