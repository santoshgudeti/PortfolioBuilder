import pytest
from services.groq_service import (
    _parse_json_response,
    _empty_fallback,
)


class TestParseJsonResponse:
    def test_valid_json(self):
        raw = '{"name": "John", "skills": ["Python"]}'
        result = _parse_json_response(raw)
        assert result == {"name": "John", "skills": ["Python"]}

    def test_json_with_markdown_codeblock(self):
        raw = '```json\n{"name": "John"}\n```'
        result = _parse_json_response(raw)
        assert result == {"name": "John"}

    def test_json_with_codeblock_no_lang(self):
        raw = '```\n{"name": "Jane"}\n```'
        result = _parse_json_response(raw)
        assert result == {"name": "Jane"}

    def test_invalid_json_returns_none(self):
        raw = "this is not json"
        result = _parse_json_response(raw)
        assert result is None

    def test_empty_string_returns_none(self):
        assert _parse_json_response("") is None
        assert _parse_json_response("   ") is None

    def test_json_with_extra_text_after(self):
        raw = '{"name": "John"} some extra text'
        result = _parse_json_response(raw)
        assert result is None


class TestEmptyFallback:
    def test_return_structure(self):
        text = "Some resume text"
        result = _empty_fallback(text)
        assert result["name"] == ""
        assert result["title"] == ""
        assert result["email"] == ""
        assert result["summary"] == text[:500]
        assert result["skills"] == []
        assert result["projects"] == []
        assert result["experience"] == []
        assert result["education"] == []
        assert result["github"] is None
        assert result["linkedin"] is None
        assert result["website"] is None

    def test_summary_truncated(self):
        long_text = "x" * 1000
        result = _empty_fallback(long_text)
        assert len(result["summary"]) == 500

    def test_summary_not_truncated(self):
        short_text = "short text"
        result = _empty_fallback(short_text)
        assert result["summary"] == "short text"
