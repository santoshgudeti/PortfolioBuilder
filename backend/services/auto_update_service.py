import json
import re
from datetime import datetime, timezone
from urllib.parse import urlparse

import httpx
from loguru import logger


GITHUB_API = "https://api.github.com"
MEDIUM_RSS = "https://medium.com/feed/@"


async def fetch_github_repos(username: str) -> list[dict]:
    """Fetch public repos from GitHub. Returns list with name, description, url, language, topics, stars."""
    url = f"{GITHUB_API}/users/{username}/repos?sort=updated&per_page=30&type=public"
    async with httpx.AsyncClient(timeout=15) as client:
        try:
            resp = await client.get(url, headers={"Accept": "application/vnd.github.v3+json", "User-Agent": "PortfolioBuilder/1.0"})
            if resp.status_code == 404:
                return []
            resp.raise_for_status()
            repos = resp.json()
        except Exception as e:
            logger.error(f"GitHub fetch failed for {username}: {e}")
            return []

    results = []
    for repo in repos:
        if repo.get("fork"):
            continue
        results.append({
            "name": repo.get("name", ""),
            "description": (repo.get("description") or "")[:300],
            "url": repo.get("html_url", ""),
            "homepage": repo.get("homepage") or "",
            "language": repo.get("language") or "",
            "topics": repo.get("topics", []) or [],
            "stars": repo.get("stargazers_count", 0),
            "forks": repo.get("forks_count", 0),
            "updated_at": repo.get("updated_at", ""),
        })
    return results


async def fetch_medium_posts(username: str) -> list[dict]:
    """Fetch latest posts from Medium RSS. Returns list with title, url, description, pub_date."""
    url = f"{MEDIUM_RSS}{username}"
    async with httpx.AsyncClient(timeout=15) as client:
        try:
            resp = await client.get(url, headers={"User-Agent": "PortfolioBuilder/1.0"})
            if resp.status_code == 404 or not resp.text.strip():
                return []
            resp.raise_for_status()
            text = resp.text
        except Exception as e:
            logger.error(f"Medium RSS fetch failed for {username}: {e}")
            return []

    posts = []
    try:
        import xml.etree.ElementTree as ET
        root = ET.fromstring(text)
        ns = {"atom": "http://www.w3.org/2005/Atom", "content": "http://purl.org/rss/1.0/modules/content/"}

        for item in root.iter("item"):
            title = item.findtext("title", "")
            link = item.findtext("link", "")
            description = item.findtext("description", "")
            pub_date_str = item.findtext("pubDate", "")
            # Clean HTML tags from description
            description = re.sub(r"<[^>]+>", "", description)[:300]

            pub_date = None
            if pub_date_str:
                try:
                    from email.utils import parsedate_to_datetime
                    pub_date = parsedate_to_datetime(pub_date_str).isoformat()
                except Exception:
                    pub_date = pub_date_str

            if title and link:
                posts.append({
                    "title": title,
                    "url": link,
                    "description": description.strip(),
                    "published_at": pub_date or "",
                })
    except Exception as e:
        logger.error(f"Medium RSS parse failed: {e}")

    return posts


def merge_into_parsed_data(parsed_data: dict, repos: list[dict] = None, posts: list[dict] = None) -> dict:
    """Merge fetched repos/posts into portfolio parsed_data."""
    updated = json.loads(json.dumps(parsed_data))

    if repos:
        existing_projects = updated.get("projects", [])
        existing_urls = {p.get("link", "").lower() for p in existing_projects if p.get("link")}
        existing_names = {p.get("title", "").lower() for p in existing_projects}
        new_projects = []
        for repo in repos:
            if repo["url"].lower() in existing_urls or repo["name"].lower() in existing_names:
                continue
            new_projects.append({
                "title": repo["name"],
                "description": repo["description"] or f"A {repo['language'] or 'software'} project.",
                "tech": [repo["language"]] if repo["language"] else [],
                "link": repo["url"],
                "source": "github",
                "stars": repo["stars"],
            })
        if new_projects:
            updated["projects"] = existing_projects + new_projects

    if posts:
        existing_links = {p.get("link", "").lower() for p in updated.get("projects", []) if p.get("link")}
        existing_titles = {p.get("title", "").lower() for p in updated.get("projects", [])}
        new_posts = []
        for post in posts:
            if post["url"].lower() in existing_links or post["title"].lower() in existing_titles:
                continue
            new_posts.append({
                "title": post["title"],
                "description": post["description"],
                "link": post["url"],
                "source": "medium",
                "published_at": post["published_at"],
            })
        if new_posts:
            updated["projects"] = updated.get("projects", []) + new_posts
            # Also add to a blog section
            blog_entries = updated.get("blog", [])
            blog_entries.extend(new_posts)
            updated["blog"] = blog_entries

    return updated
