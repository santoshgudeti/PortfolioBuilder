import json
from groq import AsyncGroq
from loguru import logger
from config import get_settings

settings = get_settings()

QUESTIONS_PROMPT = """You are an expert technical and behavioral interviewer. Based on the candidate's career profile below, generate realistic interview questions.

Return ONLY a valid JSON object with this schema:
{
  "questions": [
    {
      "id": "unique-string-id",
      "category": "technical | behavioral | system_design | experience | situational | career",
      "question": "the interview question text",
      "context": "what part of their profile this question is based on",
      "difficulty": "easy | medium | hard",
      "expected_topics": ["array of key topics the answer should cover"]
    }
  ],
  "focus_areas": ["array of 2-3 areas they should focus on based on their target roles"]
}

Rules:
- Generate 8-12 questions covering different categories
- Base questions strictly on their actual experience, skills, and projects
- Make questions realistic and specific (not generic)
- Include at least 2 behavioral questions using their real experience
- Include at least 2 technical questions based on their listed skills
- Include 1-2 career/goal questions
- Return ONLY the JSON
"""

FEEDBACK_PROMPT = """You are an expert interview coach. Evaluate the candidate's answer to the interview question based on their profile context.

Return ONLY a valid JSON object with this schema:
{
  "score": "number 0-100",
  "strengths": ["array of what was done well"],
  "improvements": ["array of specific ways to improve"],
  "model_answer": "a concise 2-3 sentence model answer that would score highly",
  "key_missed_topics": ["array of important points they missed from expected_topics"]
}

Rules:
- Be constructive and specific
- Score realistically (70+ is good, 85+ is excellent)
- Base the model answer on the candidate's actual experience
- Return ONLY the JSON
"""


async def generate_questions(
    parsed_data: dict,
    career_graph: dict,
    role_focus: str = "",
) -> dict:
    """Generate interview questions based on portfolio data."""
    context = {
        "target_role": role_focus or parsed_data.get("title", "Professional"),
        "skills": parsed_data.get("skills", []),
        "experience": [
            {"role": e.get("role"), "company": e.get("company"), "description": e.get("description")[:300]}
            for e in parsed_data.get("experience", [])
        ],
        "projects": [
            {"title": p.get("title"), "description": p.get("description")[:200], "tech": p.get("tech", [])}
            for p in parsed_data.get("projects", [])
        ],
        "career_graph": career_graph,
    }

    client = AsyncGroq(api_key=settings.groq_api_key)

    try:
        completion = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": QUESTIONS_PROMPT},
                {"role": "user", "content": json.dumps(context, indent=2)},
            ],
            temperature=0.5,
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
        logger.error(f"Question generation failed: {e}")
        return {"questions": [], "focus_areas": []}


async def evaluate_answer(
    question: str,
    answer: str,
    expected_topics: list[str],
    parsed_data: dict,
    career_graph: dict,
) -> dict:
    """Evaluate a candidate's answer and return feedback."""
    context = {
        "question": question,
        "candidate_answer": answer,
        "expected_topics": expected_topics,
        "profile": {
            "skills": parsed_data.get("skills", []),
            "experience": parsed_data.get("experience", []),
        },
    }

    client = AsyncGroq(api_key=settings.groq_api_key)

    try:
        completion = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": FEEDBACK_PROMPT},
                {"role": "user", "content": json.dumps(context, indent=2)},
            ],
            temperature=0.4,
            max_tokens=1024,
        )

        raw = completion.choices[0].message.content.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
            raw = raw.strip()

        return json.loads(raw)
    except Exception as e:
        logger.error(f"Answer evaluation failed: {e}")
        return {
            "score": 0,
            "strengths": [],
            "improvements": ["Evaluation failed. Please try again."],
            "model_answer": "",
            "key_missed_topics": [],
        }
