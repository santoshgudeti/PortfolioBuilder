import json
from groq import AsyncGroq
from loguru import logger
from config import get_settings
from services.cache import get_cached_parse, set_cached_parse

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


def _parse_json_response(raw: str) -> dict | None:
    """Try to extract valid JSON from LLM response. Returns None on failure."""
    raw = raw.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return None


def _empty_fallback(resume_text: str) -> dict:
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


RETRY_TONES = ["professional", "startup", "creative"]


async def _call_groq(client: AsyncGroq, prompt: str, resume_text: str, model: str = "llama-3.1-8b-instant") -> str | None:
    """Make a single Groq API call. Returns raw text or None on failure."""
    try:
        completion = await client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": f"Parse this resume:\n\n{resume_text}"},
            ],
            temperature=0.3,
            max_tokens=4096,
        )
        return completion.choices[0].message.content.strip()
    except Exception as e:
        logger.warning(f"Groq API call failed: {e}")
        return None


CAREER_GRAPH_PROMPT = """You are a career analysis AI. Analyze the resume text below and extract a career knowledge graph.

Return ONLY a valid JSON object with exactly this schema (no markdown, no explanation):
{
  "skills": ["array of all individual skills mentioned, normalised"],
  "technologies": ["array of specific tools, frameworks, languages, platforms"],
  "industries": ["array of industries inferred from experience (e.g. Fintech, Healthcare, E-commerce)"],
  "roles": ["array of role titles held, from most recent to oldest"],
  "achievements": ["array of specific, measurable accomplishments inferred from the text. Convert vague statements into concrete achievements where possible."],
  "strengths": ["array of inferred professional strengths (e.g. System Design, Team Leadership, Data Analysis)"],
  "experience_years": "number (total years of professional experience, infer if not explicit)",
  "top_skills": ["top 3-5 skills that best define this person"],
  "career_level": "one of: entry | mid | senior | lead | executive",
  "interests": ["array of inferred professional interests based on projects and skills"]
}

Rules:
- Infer as much as possible from context. If the resume says 'Led migration' infer the achievement as 'Led migration of X reducing Y by Z%' even if metrics aren't explicit.
- Extract technologies from both explicit skills sections and project/experience descriptions.
- If information is truly not available, use empty arrays or reasonable defaults.
- Return ONLY the JSON, no other text.
"""


async def extract_career_graph(resume_text: str) -> dict:
    """Extract a career knowledge graph from resume text using Groq."""
    cached = get_cached_parse(resume_text, "_career_graph")
    if cached is not None:
        logger.info("Cache hit for career graph")
        return cached

    client = AsyncGroq(api_key=settings.groq_api_key)
    model = "llama-3.3-70b-versatile"

    try:
        completion = await client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": CAREER_GRAPH_PROMPT},
                {"role": "user", "content": f"Analyze this resume:\n\n{resume_text}"},
            ],
            temperature=0.2,
            max_tokens=2048,
        )
        raw = completion.choices[0].message.content.strip()
        parsed = _parse_json_response(raw)

        if parsed is not None:
            set_cached_parse(resume_text, "_career_graph", parsed)
            return parsed

        logger.warning("Failed to parse career graph JSON from Groq response")
    except Exception as e:
        logger.warning(f"Career graph extraction failed: {e}")

    return _empty_career_graph()


def _empty_career_graph() -> dict:
    return {
        "skills": [],
        "technologies": [],
        "industries": [],
        "roles": [],
        "achievements": [],
        "strengths": [],
        "experience_years": 0,
        "top_skills": [],
        "career_level": "mid",
        "interests": [],
    }


async def parse_resume_with_groq(resume_text: str, tone: str = "professional") -> dict:
    """Send resume text to Groq and return structured JSON.

    Features:
    - Content-hash cache: identical resumes return instantly
    - Auto-retry: on failure, retries with different tones before falling back
    """
    # Check cache first
    cached = get_cached_parse(resume_text, tone)
    if cached is not None:
        logger.info("Cache hit for resume parse")
        return cached

    client = AsyncGroq(api_key=settings.groq_api_key)

    # Try requested tone first, then fallback tones
    tones_to_try = [tone] + [t for t in RETRY_TONES if t != tone]

    last_error = None
    for attempt_tone in tones_to_try:
        tone_instruction = TONE_INSTRUCTIONS.get(attempt_tone, TONE_INSTRUCTIONS["professional"])
        enhanced_prompt = SYSTEM_PROMPT + f"\n\nTone: {tone_instruction}"

        raw = await _call_groq(client, enhanced_prompt, resume_text)
        if raw is None:
            last_error = "Groq API returned no response"
            continue

        parsed = _parse_json_response(raw)
        if parsed is not None:
            set_cached_parse(resume_text, tone, parsed)
            return parsed

        last_error = "Groq returned invalid JSON"
        logger.warning(f"Failed to parse JSON with tone '{attempt_tone}', trying next tone")

    # All attempts failed — return partial data instead of crashing
    logger.error(f"All Groq parsing attempts failed: {last_error}")
    fallback = _empty_fallback(resume_text)
    return fallback


REGENERATE_PROMPTS = {
    "summary": "You are a professional resume writer. Rewrite the following professional summary to be more compelling, concise, and impactful. Use active voice. Return ONLY the improved text, no explanation.",
    "tagline": "You are a personal branding expert. Create a single punchy professional tagline (max 10 words) based on the following. Return ONLY the tagline, no explanation.",
    "project_description": "You are a technical writer. Rewrite the following project description to be more impressive and highlight impact. Keep it under 2 sentences. Return ONLY the improved text.",
    "experience_description": "You are a resume expert. Rewrite the following job description to use strong action verbs and quantify impact where possible. Return ONLY the improved text.",
    "bio": "You are a personal branding expert. Rewrite the following bio to be more engaging and professional. Return ONLY the improved text.",
}


async def regenerate_field_with_groq(field: str, current_value: str, context: str = "") -> str:
    """Use Groq to improve a specific portfolio field."""
    client = AsyncGroq(api_key=settings.groq_api_key)

    system_prompt = REGENERATE_PROMPTS.get(field, "Improve the following text professionally. Return ONLY the improved text.")
    user_content = current_value
    if context:
        user_content = f"Context: {context}\n\nText to improve: {current_value}"

    completion = await client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content},
        ],
        temperature=0.7,
        max_tokens=512,
    )

    return completion.choices[0].message.content.strip()


async def check_health() -> bool:
    """Verify Groq API connectivity with a minimal request."""
    try:
        client = AsyncGroq(api_key=settings.groq_api_key)
        await client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": "ping"}],
            max_tokens=5
        )
        return True
    except Exception:
        return False


async def analyze_portfolio_spam(portfolio_data: dict) -> dict:
    """Use AI to detect if a portfolio contains spam, or placeholder content."""
    client = AsyncGroq(api_key=settings.groq_api_key)

    prompt = """Analyze the following portfolio data for spam, placeholder content (like "foo", "bar", "test", "lorem ipsum"), or fake information.
Determine if this is a legitimate professional portfolio or low-quality/test content.

Return ONLY a valid JSON object with:
{
  "is_spam": boolean,
  "confidence": number (0-1),
  "reason": "string explaining the decision",
  "category": "legitimate" | "placeholder" | "spam" | "low_quality"
}

Data to analyze:
""" + json.dumps(portfolio_data, indent=2)

    try:
        completion = await client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are a professional content moderator for a portfolio hosting platform."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.1,
            max_tokens=512,
            response_format={"type": "json_object"}
        )
        
        result = json.loads(completion.choices[0].message.content)
        return result
    except Exception as e:
        return {
            "is_spam": False,
            "confidence": 0,
            "reason": f"Analysis failed: {str(e)}",
            "category": "unknown"
        }

