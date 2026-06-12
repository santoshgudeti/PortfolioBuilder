import pytest
from services.analytics_service import classify_visitor, is_mobile, clean_referrer


class TestClassifyVisitor:
    def test_bot_detection(self):
        assert classify_visitor("Mozilla/5.0 bot", None) == ("bot", 0)
        assert classify_visitor("Googlebot/2.1", None) == ("bot", 0)
        assert classify_visitor("python-requests/2.28", None) == ("bot", 0)
        assert classify_visitor("curl/7.68", None) == ("bot", 0)
        assert classify_visitor("Mozilla/5.0 crawler", None) == ("bot", 0)
        assert classify_visitor("HeadlessChrome", None) == ("bot", 0)
        assert classify_visitor("AhrefsBot/7.0", None) == ("bot", 0)

    def test_bot_lowercase_user_agent(self):
        assert classify_visitor("BOT", None) == ("bot", 0)

    def test_recruiter_referrer_detection(self):
        assert classify_visitor(None, "https://linkedin.com/recruiter") == ("recruiter", 95)
        assert classify_visitor(None, "https://indeed.com/viewjob") == ("recruiter", 95)
        assert classify_visitor(None, "https://greenhouse.io/jobs") == ("recruiter", 95)
        assert classify_visitor(None, "https://wellfound.com/company") == ("recruiter", 95)

    def test_recruiter_user_agent_detection(self):
        assert classify_visitor("Greenhouse/1.0", "https://example.com") == ("recruiter", 90)
        assert classify_visitor("Lever/2.0", None) == ("recruiter", 90)

    def test_linkedin_professional(self):
        result, score = classify_visitor(None, "https://linkedin.com/in/johndoe")
        assert result == "professional"
        assert score == 70

    def test_github_peer(self):
        assert classify_visitor(None, "https://github.com/someuser") == ("peer", 50)

    def test_stackoverflow_peer(self):
        assert classify_visitor(None, "https://stackoverflow.com/questions/123") == ("peer", 55)
        assert classify_visitor(None, "https://stackexchange.com/questions") == ("peer", 55)

    def test_academic_researcher(self):
        assert classify_visitor(None, "https://scholar.google.com/citations") == ("researcher", 60)
        assert classify_visitor(None, "https://researchgate.net/profile") == ("researcher", 60)
        assert classify_visitor(None, "https://mit.edu/~jdoe") == ("researcher", 65)

    def test_direct_high_intent(self):
        assert classify_visitor(None, "direct") == ("direct", 75)
        assert classify_visitor(None, "") == ("direct", 75)
        assert classify_visitor(None, None) == ("direct", 75)

    def test_social_media(self):
        assert classify_visitor(None, "https://twitter.com/johndoe") == ("social", 40)
        assert classify_visitor(None, "https://x.com/johndoe") == ("social", 40)
        assert classify_visitor(None, "https://facebook.com/johndoe") == ("social", 30)
        assert classify_visitor(None, "https://reddit.com/r/programming") == ("social", 35)

    def test_search_engine(self):
        assert classify_visitor(None, "https://google.com/search?q=portfolio") == ("search", 45)
        assert classify_visitor(None, "https://bing.com/search") == ("search", 45)
        assert classify_visitor(None, "https://duckduckgo.com/?q=portfolio") == ("search", 45)

    def test_general_referral_fallback(self):
        assert classify_visitor(None, "https://someblog.com/article") == ("referral", 50)

    def test_bot_check_takes_priority(self):
        """Bot check happens first - bot UA returns bot even with recruiter referrer."""
        result, score = classify_visitor("Googlebot/2.1", "https://linkedin.com/recruiter")
        assert result == "bot"
        assert score == 0

    def test_ua_none_referrer_none(self):
        assert classify_visitor(None, None) == ("direct", 75)

    def test_case_insensitivity(self):
        assert classify_visitor(None, "LINKEDIN.COM/RECRUITER") == ("recruiter", 95)
        assert classify_visitor(None, "GITHUB.COM/USER") == ("peer", 50)


class TestIsMobile:
    def test_mobile_keywords(self):
        assert is_mobile("Mozilla/5.0 Mobile") is True
        assert is_mobile("Mozilla/5.0 Android") is True
        assert is_mobile("Mozilla/5.0 iPhone") is True
        assert is_mobile("Mozilla/5.0 iPad") is True
        assert is_mobile("Mozilla/5.0 iPod") is True

    def test_desktop_user_agent(self):
        assert is_mobile("Mozilla/5.0 Windows NT 10.0") is False
        assert is_mobile("Mozilla/5.0 Macintosh") is False
        assert is_mobile("Mozilla/5.0 Linux x86_64") is False

    def test_none_user_agent(self):
        assert is_mobile(None) is False

    def test_empty_string(self):
        assert is_mobile("") is False

    def test_case_insensitivity(self):
        assert is_mobile("MOBILE") is True
        assert is_mobile("ANDROID") is True


class TestCleanReferrer:
    def test_direct(self):
        assert clean_referrer(None) == "Direct"
        assert clean_referrer("") == "Direct"
        assert clean_referrer("direct") == "Direct"

    def test_linkedin(self):
        assert clean_referrer("https://linkedin.com/in/johndoe") == "LinkedIn"
        assert clean_referrer("https://www.linkedin.com/feed") == "LinkedIn"

    def test_twitter(self):
        assert clean_referrer("https://twitter.com/johndoe") == "Twitter/X"
        assert clean_referrer("https://x.com/johndoe") == "Twitter/X"

    def test_github(self):
        assert clean_referrer("https://github.com/johndoe") == "GitHub"

    def test_google(self):
        assert clean_referrer("https://google.com/search") == "Google"

    def test_bing(self):
        assert clean_referrer("https://bing.com/search") == "Bing"

    def test_facebook(self):
        assert clean_referrer("https://facebook.com/johndoe") == "Facebook"
        assert clean_referrer("https://fb.com/johndoe") == "Facebook"

    def test_reddit(self):
        assert clean_referrer("https://reddit.com/r/programming") == "Reddit"

    def test_wellfound(self):
        assert clean_referrer("https://wellfound.com/company") == "Wellfound"

    def test_indeed(self):
        assert clean_referrer("https://indeed.com/viewjob") == "Indeed"

    def test_glassdoor(self):
        assert clean_referrer("https://glassdoor.com/company") == "Glassdoor"

    def test_unknown_domain(self):
        assert clean_referrer("https://example.com/page") == "example.com"
        assert clean_referrer("https://www.someblog.org/article") == "someblog.org"

    def test_malformed_url(self):
        result = clean_referrer("not a url at all")
        assert result == "Other"
