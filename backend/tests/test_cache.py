import pytest
from services.cache import get_cached_parse, set_cached_parse


class TestResumeCache:
    def test_cache_miss_returns_none(self):
        result = get_cached_parse("some resume text", "professional")
        assert result is None

    def test_cache_set_and_get(self):
        text = "unique resume content abc123"
        data = {"name": "Test User", "skills": ["Python"]}
        set_cached_parse(text, "professional", data)

        cached = get_cached_parse(text, "professional")
        assert cached == data

    def test_cache_different_tone_is_different(self):
        text = "same resume content"
        set_cached_parse(text, "professional", {"name": "Pro"})
        set_cached_parse(text, "creative", {"name": "Creative"})

        pro = get_cached_parse(text, "professional")
        creative = get_cached_parse(text, "creative")
        assert pro == {"name": "Pro"}
        assert creative == {"name": "Creative"}

    def test_cache_different_text_is_different(self):
        set_cached_parse("resume A", "professional", {"name": "Alice"})
        set_cached_parse("resume B", "professional", {"name": "Bob"})

        a = get_cached_parse("resume A", "professional")
        b = get_cached_parse("resume B", "professional")
        assert a == {"name": "Alice"}
        assert b == {"name": "Bob"}
