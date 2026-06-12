import json
from groq import AsyncGroq
from loguru import logger
from config import get_settings

settings = get_settings()

BRANDING_PROMPTS = {
    "linkedin_bio": """You are a personal branding expert. Write a compelling LinkedIn 'About' section based on the career data below.

The bio should:
- Be 3-4 paragraphs (200-300 words)
- Start with a strong hook
- Cover: who they are, what they do, key achievements, what they're looking for
- Use the specified tone
- Be ready to copy-paste into LinkedIn

Return ONLY the bio text, no explanation or markdown.""",

    "twitter_bio": """You are a personal branding expert. Write a concise Twitter/X profile bio based on the career data below.

The bio should:
- Be under 160 characters
- Include relevant emojis (2-3 max)
- Communicate role, expertise, and personality
- Use the specified tone

Return ONLY the bio text.""",

    "github_readme": """You are a personal branding expert. Write a GitHub profile README based on the career data below.

Include:
- A header with role and tagline
- A brief about section
- Key skills/technologies section (with emoji badges style)
- Currently working on / interested in
- Contact info

Use markdown formatting. Keep it under 40 lines.
Return ONLY the markdown.""",

    "speaker_bio": """You are a personal branding expert. Write a professional speaker/introduction bio based on the career data below.

The bio should:
- Be 3-5 sentences, third person
- Highlight expertise, experience, and speaking topics
- Be suitable for conference websites and event introductions
- Use the specified tone

Return ONLY the bio text.""",

    "founder_bio": """You are a personal branding expert. Write a compelling founder/investor bio based on the career data below.

The bio should:
- Be 2-3 paragraphs
- Communicate vision, traction, and expertise
- Be suitable for pitch decks, investor pages, and startup directories
- Use the specified tone

Return ONLY the bio text.""",

    "personal_website_about": """You are a personal branding expert. Write an 'About Me' page for a personal website based on the career data below.

The bio should:
- Be 3-5 paragraphs
- Tell a story: background → journey → current focus → mission
- Include personality and authenticity
- Use the specified tone

Return ONLY the text, no HTML or markdown.""",
}

TONE_INSTRUCTIONS_BRANDING = {
    "professional": "Professional, confident, achievement-oriented. Suitable for corporate contexts.",
    "casual": "Friendly, approachable, conversational. Suitable for startups and creative roles.",
    "executive": "Authoritative, visionary, high-level. Suitable for leadership and C-suite positioning.",
    "technical": "Precise, detail-oriented, focused on expertise depth. Suitable for engineering and research roles.",
}


async def generate_brand_asset(
    career_graph: dict,
    parsed_data: dict,
    asset_type: str,
    tone: str = "professional",
) -> str:
    """Generate a personal brand asset from career data."""
    prompt_template = BRANDING_PROMPTS.get(asset_type)
    if not prompt_template:
        raise ValueError(f"Unknown asset type: {asset_type}. Valid: {list(BRANDING_PROMPTS.keys())}")

    tone_instruction = TONE_INSTRUCTIONS_BRANDING.get(tone, TONE_INSTRUCTIONS_BRANDING["professional"])

    context = {
        "career_graph": career_graph,
        "parsed_data": parsed_data,
    }

    system_prompt = f"{prompt_template}\n\nTone: {tone_instruction}"

    client = AsyncGroq(api_key=settings.groq_api_key)

    try:
        completion = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Generate based on this career data:\n\n{json.dumps(context, indent=2)}"},
            ],
            temperature=0.7,
            max_tokens=1024,
        )
        return completion.choices[0].message.content.strip()
    except Exception as e:
        logger.error(f"Brand asset generation failed ({asset_type}): {e}")
        raise


async def generate_all_brand_assets(
    career_graph: dict,
    parsed_data: dict,
    tone: str = "professional",
) -> dict:
    """Generate all brand assets in parallel."""
    import asyncio

    async def safe_generate(asset_type: str) -> tuple[str, str]:
        try:
            result = await generate_brand_asset(career_graph, parsed_data, asset_type, tone)
            return (asset_type, result)
        except Exception as e:
            logger.warning(f"Failed to generate {asset_type}: {e}")
            return (asset_type, f"Generation failed: {e}")

    tasks = [safe_generate(asset_type) for asset_type in BRANDING_PROMPTS.keys()]
    results = await asyncio.gather(*tasks)
    return dict(results)
