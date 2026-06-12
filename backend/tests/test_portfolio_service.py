import pytest
from utils.slug import generate_slug


class TestGenerateSlug:
    def test_basic_name(self):
        slug = generate_slug("John Doe", "abc123")
        assert slug.startswith("john-doe-")
        assert slug.endswith("abc123")

    def test_name_with_special_chars(self):
        slug = generate_slug("John! @Doe", "abc123")
        assert slug.startswith("john-doe-")
        assert slug.endswith("abc123")

    def test_empty_name(self):
        slug = generate_slug("", "abc123")
        assert slug.startswith("user-")
        assert slug.endswith("abc123")

    def test_name_with_numbers(self):
        slug = generate_slug("John2 Doe", "abc123")
        assert slug.startswith("john2-doe-")

    def test_unicode_name(self):
        slug = generate_slug("Jöhn Döe", "abc123")
        # Non-ASCII chars (ö) are stripped, leaving "Jhn De" -> "jhn-de"
        assert slug.startswith("jhn-de-")

    def test_long_user_id_suffix(self):
        slug = generate_slug("Test", "abcdefghij")
        assert slug.endswith("abcdef")
        assert len(slug) > 5

    def test_different_user_ids_different_slugs(self):
        slug1 = generate_slug("Alice", "aaa111")
        slug2 = generate_slug("Alice", "bbb222")
        assert slug1 != slug2
