import pytest
from unittest.mock import AsyncMock, patch, MagicMock

from services.content_service import (
    _build_profile_summary,
    generate_content,
    regenerate_content,
    CONTENT_TYPES,
    TONE_OPTIONS,
)
from services.achievement_service import discover_achievements
from services.branding_service import generate_brand_asset, generate_all_brand_assets, BRANDING_PROMPTS, TONE_INSTRUCTIONS_BRANDING
from services.copilot_service import answer_question
from services.dynamic_portfolio_service import generate_role_version
from services.interview_service import generate_questions, evaluate_answer
from services.job_matching_service import find_matching_roles
from services.resume_optimizer import analyze_resume
from services.video_service import generate_video_script


# ─── Fixtures ───────────────────────────────────────────────────────

@pytest.fixture
def sample_parsed_data():
    return {
        "title": "Senior Software Engineer",
        "name": "Jane Doe",
        "summary": "Experienced full-stack engineer with 8+ years building scalable web applications.",
        "tagline": "Building the future, one commit at a time.",
        "location": "San Francisco, CA",
        "email": "jane@example.com",
        "github": "https://github.com/janedoe",
        "linkedin": "https://linkedin.com/in/janedoe",
        "website": "https://janedoe.dev",
        "skills": ["Python", "TypeScript", "React", "FastAPI", "PostgreSQL", "AWS", "Docker"],
        "experience": [
            {
                "role": "Senior Engineer",
                "company": "TechCorp",
                "description": "Led migration of monolith to microservices. Improved API response times by 40%.",
                "start_date": "2020-01",
                "end_date": None,
                "duration": "2020-Present",
            },
            {
                "role": "Full Stack Developer",
                "company": "Acme Startup",
                "description": "Built customer-facing features using React and Node.js.",
                "start_date": "2017-03",
                "end_date": "2019-12",
                "duration": "2017-2020",
            },
        ],
        "projects": [
            {
                "title": "PortfolioBuilder",
                "description": "AI-powered portfolio generator with Groq integration.",
                "tech": ["Python", "FastAPI", "React", "Groq API"],
                "link": "https://github.com/janedoe/portfoliobuilder",
            }
        ],
        "education": [
            {"degree": "B.S. Computer Science", "school": "MIT", "year": "2017"}
        ],
    }


@pytest.fixture
def sample_career_graph():
    return {
        "career_level": "Senior",
        "experience_years": 8,
        "industries": ["Technology", "SaaS"],
        "achievements": [
            "Reduced API latency by 40% through architectural improvements",
            "Led a team of 5 engineers on microservices migration",
        ],
        "interests": ["AI/ML", "Distributed Systems", "Developer Tools"],
        "skills": ["Python", "TypeScript", "React", "FastAPI", "PostgreSQL", "AWS", "Docker", "Kubernetes"],
    }


@pytest.fixture
def mock_groq():
    """Create a mock AsyncGroq client that returns JSON response."""
    with patch("services.content_service.AsyncGroq") as mock, \
         patch("services.achievement_service.AsyncGroq") as mock2, \
         patch("services.branding_service.AsyncGroq") as mock3, \
         patch("services.copilot_service.AsyncGroq") as mock4, \
         patch("services.dynamic_portfolio_service.AsyncGroq") as mock5, \
         patch("services.interview_service.AsyncGroq") as mock6, \
         patch("services.job_matching_service.AsyncGroq") as mock7, \
         patch("services.resume_optimizer.AsyncGroq") as mock8, \
         patch("services.video_service.AsyncGroq") as mock9:
        mock_instances = [m.return_value for m in [mock, mock2, mock3, mock4, mock5, mock6, mock7, mock8, mock9]]
        for inst in mock_instances:
            inst.chat.completions.create = AsyncMock()
        yield mock_instances


# ─── _build_profile_summary tests (pure function) ───────────────────

class TestBuildProfileSummary:
    def test_basic_profile_summary(self, sample_parsed_data, sample_career_graph):
        result = _build_profile_summary(sample_parsed_data, sample_career_graph)
        assert "Senior Software Engineer" in result
        assert "8+ years" in result
        assert "Python" in result
        assert "TechCorp" in result
        assert "PortfolioBuilder" in result
        assert "Reduced API latency" in result

    def test_empty_parsed_data(self):
        result = _build_profile_summary({}, {})
        assert "Name/Role: Professional" in result

    def test_no_career_graph(self, sample_parsed_data):
        result = _build_profile_summary(sample_parsed_data, None)
        assert "Senior Software Engineer" in result
        assert "Reduced API latency" not in result

    def test_truncates_long_summary(self):
        data = {"title": "Engineer", "summary": "x" * 500}
        result = _build_profile_summary(data, {})
        assert len(result.split("Summary:")[1].strip()) <= 400

    def test_truncates_long_experience(self):
        data = {
            "title": "Engineer",
            "experience": [{"role": "Dev", "company": "Co", "description": "x" * 500}],
        }
        result = _build_profile_summary(data, {})
        desc_line = [l for l in result.split("\n") if "x" in l][0]
        assert len(desc_line) <= 300

    def test_includes_skills(self, sample_parsed_data):
        result = _build_profile_summary(sample_parsed_data, {})
        assert "Python" in result
        assert "TypeScript" in result

    def test_includes_projects(self, sample_parsed_data):
        result = _build_profile_summary(sample_parsed_data, {})
        assert "PortfolioBuilder" in result


# ─── Content Service tests ──────────────────────────────────────────

class TestContentService:
    @pytest.mark.asyncio
    async def test_generate_content_invalid_type(self, sample_parsed_data, sample_career_graph):
        result = await generate_content("invalid_type", "professional", "", sample_parsed_data, sample_career_graph)
        assert "error" in result
        assert "Invalid content type" in result["error"]

    @pytest.mark.asyncio
    async def test_generate_content_invalid_tone_falls_back(self, mock_groq, sample_parsed_data, sample_career_graph):
        mock_groq[0].chat.completions.create.return_value = MagicMock(
            choices=[MagicMock(message=MagicMock(content='{"title":"T","content":"C","hashtags":[],"estimated_read_time_minutes":"2","key_topics_covered":[]}'))]
        )
        result = await generate_content("linkedin_post", "nonexistent_tone", "", sample_parsed_data, sample_career_graph)
        assert result["content_type"] == "linkedin_post"
        assert result["tone"] == "professional"

    @pytest.mark.asyncio
    async def test_generate_content_parses_json_from_groq(self, mock_groq, sample_parsed_data, sample_career_graph):
        expected_response = '{"title":"My Post","content":"Hello world","hashtags":["#tech"],"estimated_read_time_minutes":"3","key_topics_covered":["AI"]}'
        mock_groq[0].chat.completions.create.return_value = MagicMock(
            choices=[MagicMock(message=MagicMock(content=expected_response))]
        )
        result = await generate_content("linkedin_post", "professional", "talk about AI", sample_parsed_data, sample_career_graph)
        assert result["title"] == "My Post"
        assert result["content"] == "Hello world"

    @pytest.mark.asyncio
    async def test_generate_content_strips_markdown_fences(self, mock_groq, sample_parsed_data, sample_career_graph):
        response_with_fences = '```json\n{"title":"T","content":"C","hashtags":[],"estimated_read_time_minutes":"2","key_topics_covered":[]}\n```'
        mock_groq[0].chat.completions.create.return_value = MagicMock(
            choices=[MagicMock(message=MagicMock(content=response_with_fences))]
        )
        result = await generate_content("linkedin_post", "professional", "", sample_parsed_data, sample_career_graph)
        assert result["title"] == "T"
        assert result["content"] == "C"

    @pytest.mark.asyncio
    async def test_generate_content_handles_groq_error(self, mock_groq, sample_parsed_data, sample_career_graph):
        mock_groq[0].chat.completions.create.side_effect = Exception("API error")
        result = await generate_content("linkedin_post", "professional", "", sample_parsed_data, sample_career_graph)
        assert "error" in result

    @pytest.mark.asyncio
    async def test_regenerate_content_parses_json(self, mock_groq, sample_parsed_data, sample_career_graph):
        expected = '{"title":"Revised","content":"Revised content","hashtags":[],"estimated_read_time_minutes":"2","key_topics_covered":[]}'
        mock_groq[0].chat.completions.create.return_value = MagicMock(
            choices=[MagicMock(message=MagicMock(content=expected))]
        )
        result = await regenerate_content("Original", "Make it better", sample_parsed_data, sample_career_graph)
        assert result["title"] == "Revised"


# ─── Achievement Service tests ─────────────────────────────────────

class TestAchievementService:
    @pytest.mark.asyncio
    async def test_discover_achievements_no_items(self, sample_parsed_data, sample_career_graph):
        sample_parsed_data["projects"] = []
        result = await discover_achievements(sample_parsed_data, sample_career_graph)
        assert result == []

    @pytest.mark.asyncio
    async def test_discover_achievements_parses_json(self, mock_groq, sample_parsed_data, sample_career_graph):
        mock_groq[1].chat.completions.create.return_value = MagicMock(
            choices=[MagicMock(message=MagicMock(content='[{"suggestion":"Add metrics","confidence":0.9}]'))]
        )
        result = await discover_achievements(sample_parsed_data, sample_career_graph)
        assert result == [{"suggestion": "Add metrics", "confidence": 0.9}]

    @pytest.mark.asyncio
    async def test_discover_achievements_strips_markdown_fences(self, mock_groq, sample_parsed_data, sample_career_graph):
        mock_groq[1].chat.completions.create.return_value = MagicMock(
            choices=[MagicMock(message=MagicMock(content='```json\n[{"suggestion":"x"}]\n```'))]
        )
        result = await discover_achievements(sample_parsed_data, sample_career_graph)
        assert result == [{"suggestion": "x"}]

    @pytest.mark.asyncio
    async def test_discover_achievements_handles_error(self, mock_groq, sample_parsed_data, sample_career_graph):
        mock_groq[1].chat.completions.create.side_effect = Exception("API error")
        result = await discover_achievements(sample_parsed_data, sample_career_graph)
        assert result == []



# ─── Branding Service tests ─────────────────────────────────────────

class TestBrandingService:
    @pytest.mark.asyncio
    async def test_generate_brand_asset_invalid_type(self, sample_parsed_data, sample_career_graph):
        with pytest.raises(ValueError, match="Unknown asset type"):
            await generate_brand_asset(sample_career_graph, sample_parsed_data, "invalid_type")

    @pytest.mark.asyncio
    async def test_generate_brand_asset_returns_text(self, mock_groq, sample_parsed_data, sample_career_graph):
        mock_groq[2].chat.completions.create.return_value = MagicMock(
            choices=[MagicMock(message=MagicMock(content="A professional bio for LinkedIn..."))]
        )
        result = await generate_brand_asset(sample_career_graph, sample_parsed_data, "linkedin_bio", "professional")
        assert result == "A professional bio for LinkedIn..."

    @pytest.mark.asyncio
    async def test_generate_brand_asset_handles_error(self, mock_groq, sample_parsed_data, sample_career_graph):
        mock_groq[2].chat.completions.create.side_effect = Exception("API error")
        with pytest.raises(Exception):
            await generate_brand_asset(sample_career_graph, sample_parsed_data, "linkedin_bio", "professional")

    @pytest.mark.asyncio
    async def test_generate_all_brand_assets(self, mock_groq, sample_parsed_data, sample_career_graph):
        mock_groq[2].chat.completions.create.return_value = MagicMock(
            choices=[MagicMock(message=MagicMock(content="Generated asset content..."))]
        )
        results = await generate_all_brand_assets(sample_career_graph, sample_parsed_data, "professional")
        assert len(results) == len(BRANDING_PROMPTS)
        for key in BRANDING_PROMPTS:
            assert key in results
            assert results[key] == "Generated asset content..."

    @pytest.mark.asyncio
    async def test_generate_all_brand_assets_partial_failure(self, mock_groq, sample_parsed_data, sample_career_graph):
        call_count = [0]
        async def side_effect(*args, **kwargs):
            call_count[0] += 1
            if call_count[0] == 1:
                raise Exception("First one fails")
            return MagicMock(choices=[MagicMock(message=MagicMock(content="OK"))])
        mock_groq[2].chat.completions.create.side_effect = side_effect
        results = await generate_all_brand_assets(sample_career_graph, sample_parsed_data)
        assert len(results) == len(BRANDING_PROMPTS)
        first_key = list(BRANDING_PROMPTS.keys())[0]
        assert "Generation failed" in results[first_key]
        second_key = list(BRANDING_PROMPTS.keys())[1]
        assert results[second_key] == "OK"


# ─── Copilot Service tests ──────────────────────────────────────────

class TestCopilotService:
    @pytest.mark.asyncio
    async def test_answer_question_returns_text(self, mock_groq, sample_parsed_data, sample_career_graph):
        mock_groq[3].chat.completions.create.return_value = MagicMock(
            choices=[MagicMock(message=MagicMock(content="Jane has 8+ years of experience..."))]
        )
        result = await answer_question("What experience does Jane have?", sample_parsed_data, sample_career_graph)
        assert result == "Jane has 8+ years of experience..."

    @pytest.mark.asyncio
    async def test_answer_question_handles_error(self, mock_groq, sample_parsed_data, sample_career_graph):
        mock_groq[3].chat.completions.create.side_effect = Exception("API error")
        result = await answer_question("Question", sample_parsed_data, sample_career_graph)
        assert "Sorry" in result


# ─── Dynamic Portfolio Service tests ────────────────────────────────

class TestDynamicPortfolioService:
    @pytest.mark.asyncio
    async def test_generate_role_version_parses_json(self, mock_groq, sample_parsed_data, sample_career_graph):
        expected = '{"title":"ML Engineer","summary":"ML professional","skills":["Python"],"experience":[],"projects":[],"achievements":[],"tailoring_notes":"Focused on ML"}'
        mock_groq[4].chat.completions.create.return_value = MagicMock(
            choices=[MagicMock(message=MagicMock(content=expected))]
        )
        result = await generate_role_version("Machine Learning Engineer", sample_parsed_data, sample_career_graph)
        assert result["title"] == "ML Engineer"
        assert result["_role"] == "Machine Learning Engineer"

    @pytest.mark.asyncio
    async def test_generate_role_version_strips_markdown_fences(self, mock_groq, sample_parsed_data, sample_career_graph):
        mock_groq[4].chat.completions.create.return_value = MagicMock(
            choices=[MagicMock(message=MagicMock(content='```json\n{"title":"ML Engineer","summary":"ML pro","skills":[],"experience":[],"projects":[],"achievements":[],"tailoring_notes":"x"}\n```'))]
        )
        result = await generate_role_version("ML Engineer", sample_parsed_data, sample_career_graph)
        assert result["title"] == "ML Engineer"

    @pytest.mark.asyncio
    async def test_generate_role_version_handles_error(self, mock_groq, sample_parsed_data, sample_career_graph):
        mock_groq[4].chat.completions.create.side_effect = Exception("API error")
        result = await generate_role_version("ML Engineer", sample_parsed_data, sample_career_graph)
        assert result is None


# ─── Interview Service tests ────────────────────────────────────────

class TestInterviewService:
    @pytest.mark.asyncio
    async def test_generate_questions_parses_json(self, mock_groq, sample_parsed_data, sample_career_graph):
        expected = '{"questions":[{"id":"q1","category":"technical","question":"Explain your microservices migration","context":"Led migration","difficulty":"hard","expected_topics":["microservices"]}],"focus_areas":["System Design"]}'
        mock_groq[5].chat.completions.create.return_value = MagicMock(
            choices=[MagicMock(message=MagicMock(content=expected))]
        )
        result = await generate_questions(sample_parsed_data, sample_career_graph, "Senior Engineer")
        assert len(result["questions"]) == 1
        assert result["questions"][0]["category"] == "technical"

    @pytest.mark.asyncio
    async def test_generate_questions_handles_error(self, mock_groq, sample_parsed_data, sample_career_graph):
        mock_groq[5].chat.completions.create.side_effect = Exception("API error")
        result = await generate_questions(sample_parsed_data, sample_career_graph)
        assert result == {"questions": [], "focus_areas": []}

    @pytest.mark.asyncio
    async def test_evaluate_answer_parses_json(self, mock_groq, sample_parsed_data, sample_career_graph):
        expected = '{"score":85,"strengths":["Clear structure"],"improvements":["Add metrics"],"model_answer":"I led a migration...","key_missed_topics":["performance numbers"]}'
        mock_groq[5].chat.completions.create.return_value = MagicMock(
            choices=[MagicMock(message=MagicMock(content=expected))]
        )
        result = await evaluate_answer("Question?", "My answer", ["topic1"], sample_parsed_data, sample_career_graph)
        assert result["score"] == 85

    @pytest.mark.asyncio
    async def test_evaluate_answer_handles_error(self, mock_groq, sample_parsed_data, sample_career_graph):
        mock_groq[5].chat.completions.create.side_effect = Exception("API error")
        result = await evaluate_answer("Question?", "Answer", ["topic1"], sample_parsed_data, sample_career_graph)
        assert result["score"] == 0


# ─── Job Matching Service tests ─────────────────────────────────────

class TestJobMatchingService:
    @pytest.mark.asyncio
    async def test_find_matching_roles_parses_json(self, mock_groq, sample_parsed_data, sample_career_graph):
        expected = '{"matches":[{"role_category":"Senior Backend Engineer","match_score":85,"confidence":"high","rationale":"Strong backend skills","skill_gaps":["Kubernetes"],"tailored_summary":"Expert Python engineer...","alternative_titles":["Backend Lead"],"growth_direction":"Architecture"}],"career_advice":"Focus on system design"}'
        mock_groq[6].chat.completions.create.return_value = MagicMock(
            choices=[MagicMock(message=MagicMock(content=expected))]
        )
        result = await find_matching_roles(sample_parsed_data, sample_career_graph)
        assert len(result["matches"]) == 1
        assert result["matches"][0]["match_score"] == 85

    @pytest.mark.asyncio
    async def test_find_matching_roles_handles_error(self, mock_groq, sample_parsed_data, sample_career_graph):
        mock_groq[6].chat.completions.create.side_effect = Exception("API error")
        result = await find_matching_roles(sample_parsed_data, sample_career_graph)
        assert result["matches"] == []


# ─── Resume Optimizer tests ─────────────────────────────────────────

class TestResumeOptimizer:
    @pytest.mark.asyncio
    async def test_analyze_resume_parses_json(self, mock_groq, sample_parsed_data, sample_career_graph, sample_resume_text):
        expected = '{"overall_score":78,"breakdown":{"ats_compatibility":85,"impact_metrics":60,"action_verbs":80,"keyword_optimization":75,"length_structure":90},"strengths":["Strong technical skills"],"suggestions":[{"category":"impact_metrics","priority":"high","title":"Add metrics","detail":"Quantify your achievements"}],"missing_keywords":["Kubernetes"],"ats_issues":["None"],"score_summary":"Strong resume"}'
        mock_groq[7].chat.completions.create.return_value = MagicMock(
            choices=[MagicMock(message=MagicMock(content=expected))]
        )
        result = await analyze_resume(sample_parsed_data, sample_career_graph, sample_resume_text)
        assert result["overall_score"] == 78
        assert result["breakdown"]["ats_compatibility"] == 85

    @pytest.mark.asyncio
    async def test_analyze_resume_handles_error(self, mock_groq, sample_parsed_data, sample_career_graph, sample_resume_text):
        mock_groq[7].chat.completions.create.side_effect = Exception("API error")
        result = await analyze_resume(sample_parsed_data, sample_career_graph, sample_resume_text)
        assert result["overall_score"] == 0


# ─── Video Service tests ────────────────────────────────────────────

class TestVideoService:
    @pytest.mark.asyncio
    async def test_generate_video_script_parses_json(self, mock_groq, sample_parsed_data, sample_career_graph):
        expected = '{"title":"My Portfolio","tagline":"See my work","duration_seconds":60,"total_scenes":3,"scenes":[{"scene_number":1,"type":"hook","visual_description":"Intro","narration":"Hello","duration_seconds":"10","on_screen_text":"Jane Doe","transition":"fade","music_mood":"professional"}],"total_narration_words":50,"estimated_read_time_seconds":20,"suggested_background_music":"Upbeat","production_notes":["Use good lighting"]}'
        mock_groq[8].chat.completions.create.return_value = MagicMock(
            choices=[MagicMock(message=MagicMock(content=expected))]
        )
        result = await generate_video_script(60, "professional", sample_parsed_data, sample_career_graph)
        assert result["title"] == "My Portfolio"
        assert len(result["scenes"]) == 1

    @pytest.mark.asyncio
    async def test_generate_video_script_handles_error(self, mock_groq, sample_parsed_data, sample_career_graph):
        mock_groq[8].chat.completions.create.side_effect = Exception("API error")
        result = await generate_video_script(60, "professional", sample_parsed_data, sample_career_graph)
        assert "error" in result

    @pytest.mark.asyncio
    async def test_generate_video_script_strips_markdown_fences(self, mock_groq, sample_parsed_data, sample_career_graph):
        mock_groq[8].chat.completions.create.return_value = MagicMock(
            choices=[MagicMock(message=MagicMock(content='```json\n{"title":"T","tagline":"L","duration_seconds":60,"total_scenes":1,"scenes":[],"total_narration_words":0,"estimated_read_time_seconds":0,"suggested_background_music":"","production_notes":[]}\n```'))]
        )
        result = await generate_video_script(60, "professional", sample_parsed_data, sample_career_graph)
        assert result["title"] == "T"
