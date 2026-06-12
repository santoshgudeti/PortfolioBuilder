import os


def pytest_configure(config):
    """Set test environment variables before any module imports."""
    os.environ.setdefault("SECRET_KEY", "test-secret-key-not-for-production")
    os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///./test.db")
    os.environ.setdefault("GROQ_API_KEY", "test-groq-key")


import pytest


@pytest.fixture
def sample_resume_text():
    return """John Doe
Senior Software Engineer
john@example.com | +1-555-1234 | San Francisco, CA

Professional Summary
Experienced software engineer with 8+ years building full-stack web applications.

Skills
Python, TypeScript, React, FastAPI, PostgreSQL, AWS, Docker

Experience
TechCorp Inc. | Senior Engineer | 2020-Present
Led migration of monolith to microservices architecture.
Improved API response times by 40%.

Acme Startup | Full Stack Developer | 2017-2020
Built customer-facing features using React and Node.js.

Education
MIT | B.S. Computer Science | 2013-2017

Projects
PortfolioBuilder | AI-powered portfolio generator
Python, FastAPI, React, Groq API
github.com/johndoe/portfoliobuilder
"""


@pytest.fixture
def sample_pdf_bytes():
    return b"%PDF-1.4 fake pdf bytes for testing"


@pytest.fixture
def empty_pdf_bytes():
    return b""
