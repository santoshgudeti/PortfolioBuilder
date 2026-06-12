import json
from groq import AsyncGroq
from loguru import logger
from config import get_settings

settings = get_settings()

COPILOT_SYSTEM_PROMPT = """You are an AI portfolio copilot. You answer questions from visitors about the person whose portfolio they are viewing.

You have access to the person's full career data: their parsed resume data and career knowledge graph.

Rules:
1. Only answer based on the data provided. If the data doesn't contain the answer, say "I don't have that information in their portfolio."
2. Be concise — 2-4 sentences max per answer.
3. Be professional and enthusiastic about the person's work.
4. If asked about contact or hiring, provide the relevant info from their data.
5. Never invent experience, skills, or metrics not present in the data.
6. Answer in the first person ("They have experience in...") or third person ("This person...").
7. If the question is off-topic or inappropriate, politely redirect to career topics.
"""


async def answer_question(
    question: str,
    parsed_data: dict,
    career_graph: dict,
) -> str:
    """Answer a visitor's question based on portfolio data."""
    context = {
        "about": {
            "name": parsed_data.get("name", ""),
            "title": parsed_data.get("title", ""),
            "summary": parsed_data.get("summary", ""),
            "tagline": parsed_data.get("tagline", ""),
            "location": parsed_data.get("location", ""),
            "email": parsed_data.get("email", ""),
            "github": parsed_data.get("github"),
            "linkedin": parsed_data.get("linkedin"),
            "website": parsed_data.get("website"),
        },
        "skills": parsed_data.get("skills", []),
        "experience": [
            {
                "role": e.get("role"),
                "company": e.get("company"),
                "duration": e.get("duration"),
                "description": e.get("description"),
            }
            for e in parsed_data.get("experience", [])
        ],
        "projects": [
            {
                "title": p.get("title"),
                "description": p.get("description"),
                "tech": p.get("tech", []),
            }
            for p in parsed_data.get("projects", [])
        ],
        "education": parsed_data.get("education", []),
        "career_graph": career_graph,
    }

    client = AsyncGroq(api_key=settings.groq_api_key)

    try:
        completion = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": COPILOT_SYSTEM_PROMPT},
                {"role": "user", "content": f"Portfolio data:\n\n{json.dumps(context, indent=2)}\n\nVisitor question: {question}"},
            ],
            temperature=0.5,
            max_tokens=512,
        )
        return completion.choices[0].message.content.strip()
    except Exception as e:
        logger.error(f"Copilot question failed: {e}")
        return "Sorry, I couldn't process that question right now. Please try again."
