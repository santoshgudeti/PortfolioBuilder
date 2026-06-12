import pytest
from services.auto_update_service import merge_into_parsed_data


class TestMergeIntoParsedData:
    def test_returns_deep_copy(self):
        original = {"projects": []}
        result = merge_into_parsed_data(original)
        result["projects"].append({"title": "new"})
        assert original["projects"] == []

    def test_add_new_github_project(self):
        data = {"projects": [{"title": "Existing", "link": "https://github.com/user/existing"}]}
        repos = [
            {"name": "NewRepo", "description": "A new project", "language": "Python", "url": "https://github.com/user/newrepo", "stars": 15}
        ]
        result = merge_into_parsed_data(data, repos=repos)
        titles = [p["title"] for p in result["projects"]]
        assert "Existing" in titles
        assert "NewRepo" in titles
        new = [p for p in result["projects"] if p["title"] == "NewRepo"][0]
        assert new["description"] == "A new project"
        assert new["tech"] == ["Python"]
        assert new["link"] == "https://github.com/user/newrepo"
        assert new["source"] == "github"
        assert new["stars"] == 15

    def test_skip_duplicate_github_url(self):
        data = {"projects": [{"title": "MyRepo", "link": "https://github.com/user/myrepo"}]}
        repos = [{"name": "MyRepo", "description": "desc", "language": "Python", "url": "https://github.com/user/myrepo", "stars": 5}]
        result = merge_into_parsed_data(data, repos=repos)
        assert len(result["projects"]) == 1

    def test_skip_duplicate_github_name(self):
        data = {"projects": [{"title": "MyRepo", "link": "https://example.com/different"}]}
        repos = [{"name": "MyRepo", "description": "desc", "language": "Python", "url": "https://github.com/user/myrepo", "stars": 5}]
        result = merge_into_parsed_data(data, repos=repos)
        assert len(result["projects"]) == 1

    def test_github_repo_without_language(self):
        data = {"projects": []}
        repos = [{"name": "NoLang", "description": "desc", "language": None, "url": "https://github.com/user/nolang", "stars": 0}]
        result = merge_into_parsed_data(data, repos=repos)
        assert result["projects"][0]["tech"] == []

    def test_github_repo_without_description(self):
        data = {"projects": []}
        repos = [{"name": "NoDesc", "description": None, "language": "Rust", "url": "https://github.com/user/nodesc", "stars": 3}]
        result = merge_into_parsed_data(data, repos=repos)
        assert result["projects"][0]["description"] == "A Rust project."

    def test_add_new_medium_post(self):
        data = {"projects": []}
        posts = [
            {"title": "My Blog Post", "description": "Great content", "url": "https://medium.com/@user/post", "published_at": "2025-01-01"}
        ]
        result = merge_into_parsed_data(data, posts=posts)
        assert "My Blog Post" in [p["title"] for p in result["projects"]]
        assert "My Blog Post" in [b["title"] for b in result["blog"]]
        post = result["projects"][0]
        assert post["source"] == "medium"
        assert post["link"] == "https://medium.com/@user/post"

    def test_skip_duplicate_post_url(self):
        data = {"projects": [{"title": "Post", "link": "https://medium.com/@user/post"}]}
        posts = [{"title": "Post", "description": "desc", "url": "https://medium.com/@user/post", "published_at": "2025-01-01"}]
        result = merge_into_parsed_data(data, posts=posts)
        assert len(result["projects"]) == 1

    def test_skip_duplicate_post_title(self):
        data = {"projects": [{"title": "Post", "link": "https://example.com/different"}]}
        posts = [{"title": "Post", "description": "desc", "url": "https://medium.com/@user/post", "published_at": "2025-01-01"}]
        result = merge_into_parsed_data(data, posts=posts)
        assert len(result["projects"]) == 1

    def test_no_repos_or_posts(self):
        data = {"projects": [{"title": "Existing"}]}
        result = merge_into_parsed_data(data)
        assert result == {"projects": [{"title": "Existing"}]}

    def test_both_repos_and_posts(self):
        data = {"projects": []}
        repos = [{"name": "Repo", "description": "repo", "language": "Go", "url": "https://github.com/user/repo", "stars": 5}]
        posts = [{"title": "Post", "description": "post", "url": "https://medium.com/@user/post", "published_at": "2025-01-01"}]
        result = merge_into_parsed_data(data, repos=repos, posts=posts)
        assert len(result["projects"]) == 2
        assert result["blog"] == [{"title": "Post", "description": "post", "link": "https://medium.com/@user/post", "source": "medium", "published_at": "2025-01-01"}]

    def test_case_insensitive_duplicate_check(self):
        data = {"projects": [{"title": "MyRepo", "link": "https://GITHUB.com/user/MyRepo"}]}
        repos = [{"name": "myrepo", "description": "desc", "language": "Python", "url": "https://github.com/user/myrepo", "stars": 5}]
        result = merge_into_parsed_data(data, repos=repos)
        assert len(result["projects"]) == 1

    def test_no_projects_key_in_original(self):
        data = {}
        repos = [{"name": "Repo", "description": "desc", "language": "Python", "url": "https://github.com/user/repo", "stars": 2}]
        result = merge_into_parsed_data(data, repos=repos)
        assert len(result["projects"]) == 1

    def test_no_blog_key_in_original(self):
        data = {}
        posts = [{"title": "Post", "description": "post", "url": "https://medium.com/@user/post", "published_at": "2025-01-01"}]
        result = merge_into_parsed_data(data, posts=posts)
        assert result["blog"] == [{"title": "Post", "description": "post", "link": "https://medium.com/@user/post", "source": "medium", "published_at": "2025-01-01"}]
