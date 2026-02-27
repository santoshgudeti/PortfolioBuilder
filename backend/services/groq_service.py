import json
from groq import Groq
from config import get_settings

settings = get_settings()

SYSTEM_PROMPT = """You are a resume parser AI. Extract structured information from the resume text provided.
Return ONLY a valid JSON object with exactly this schema (no markdown, no explanation):
{
  "name": "string",
  "title": "string (job title/role)",
  "email": "string",
  "phone": "string",
  "location": "string",
  "summary": "string (2-3 sentences professional summary)",
  "tagline": "string (one catchy professional tagline)",
  "skills": ["array of skill strings"],
  "projects": [
    {
      "title": "string",
      "description": "string",
      "tech": ["array of tech strings"],
      "url": "string or null",
      "github": "string or null"
    }
  ],
  "experience": [
    {
      "company": "string",
      "role": "string",
      "duration": "string",
      "description": "string"
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "year": "string"
    }
  ],
  "github": "string or null",
  "linkedin": "string or null",
  "website": "string or null"
}

Rules:
- If information is not found, use empty string "" or empty array []
- Improve and enhance the summary to be professional and compelling
- Generate a catchy tagline based on their skills and experience
- Return ONLY the JSON, no other text
"""


TONE_INSTRUCTIONS = {
    "professional": "Write in a polished, corporate tone. Use formal language, industry-standard terminology, and focus on measurable achievements.",
    "creative": "Write in a bold, expressive tone. Use vivid language, creative metaphors, and showcase personality. Make the reader feel the passion.",
    "startup": "Write in a fast-paced, modern tech tone. Use action-oriented language, focus on impact and innovation. Sound like a Y Combinator pitch.",
}


async def parse_resume_with_groq(resume_text: str, tone: str = "professional") -> dict:
    """Send resume text to Groq and return structured JSON."""
    client = Groq(api_key=settings.groq_api_key)

    tone_instruction = TONE_INSTRUCTIONS.get(tone, TONE_INSTRUCTIONS["professional"])
    enhanced_prompt = SYSTEM_PROMPT + f"\n\nTone: {tone_instruction}"

    completion = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": enhanced_prompt},
            {"role": "user", "content": f"Parse this resume:\n\n{resume_text}"},
        ],
        temperature=0.3,
        max_tokens=4096,
    )

    raw = completion.choices[0].message.content.strip()

    # Strip markdown code blocks if present
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        # Fallback: return minimal structure
        return {
            "name": "",
            "title": "",
            "email": "",
            "phone": "",
            "location": "",
            "summary": resume_text[:500],
            "tagline": "",
            "skills": [],
            "projects": [],
            "experience": [],
            "education": [],
            "github": None,
            "linkedin": None,
            "website": None,
        }


REGENERATE_PROMPTS = {
    "summary": "You are a professional resume writer. Rewrite the following professional summary to be more compelling, concise, and impactful. Use active voice. Return ONLY the improved text, no explanation.",
    "tagline": "You are a personal branding expert. Create a single punchy professional tagline (max 10 words) based on the following. Return ONLY the tagline, no explanation.",
    "project_description": "You are a technical writer. Rewrite the following project description to be more impressive and highlight impact. Keep it under 2 sentences. Return ONLY the improved text.",
    "experience_description": "You are a resume expert. Rewrite the following job description to use strong action verbs and quantify impact where possible. Return ONLY the improved text.",
    "bio": "You are a personal branding expert. Rewrite the following bio to be more engaging and professional. Return ONLY the improved text.",
}


async def regenerate_field_with_groq(field: str, current_value: str, context: str = "") -> str:
    """Use Groq to improve a specific portfolio field."""
    client = Groq(api_key=settings.groq_api_key)

    system_prompt = REGENERATE_PROMPTS.get(field, "Improve the following text professionally. Return ONLY the improved text.")
    user_content = current_value
    if context:
        user_content = f"Context: {context}\n\nText to improve: {current_value}"

    completion = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content},
        ],
        temperature=0.7,
        max_tokens=512,
    )

    return completion.choices[0].message.content.strip()

