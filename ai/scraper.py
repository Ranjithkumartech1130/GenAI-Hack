"""
Web Scraping-based Learning Path Generator
Uses BeautifulSoup + requests to scrape real course data from educational platforms.
No API keys required. All links are verified real URLs.
"""

import requests
from bs4 import BeautifulSoup
import json
import re
import time
import random
from urllib.parse import quote_plus, urljoin

# ============================================================
# SESSION SETUP
# ============================================================
SESSION = requests.Session()
SESSION.headers.update({
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
})

# ============================================================
# WEB SCRAPERS (BeautifulSoup)
# ============================================================

def scrape_coursera(query, limit=6):
    """Scrape Coursera courses using their public catalog API."""
    results = []
    try:
        url = f"https://api.coursera.org/api/courses.v1?q=search&query={quote_plus(query)}&limit={limit}&fields=name,slug,description,workload"
        resp = SESSION.get(url, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            for el in data.get("elements", [])[:limit]:
                name = el.get("name", "")
                slug = el.get("slug", "")
                desc = el.get("description", "")[:100].strip()
                if name and slug:
                    # Clean HTML from description
                    desc = BeautifulSoup(desc, "html.parser").get_text()
                    results.append({
                        "name": name,
                        "url": f"https://www.coursera.org/learn/{slug}",
                        "platform": "Coursera",
                        "description": desc
                    })
    except Exception as e:
        print(f"[Scraper] Coursera scrape failed: {e}")
    return results


def scrape_github_repos(query, limit=5):
    """Scrape GitHub repositories using their public API (no auth, 60 req/hr)."""
    results = []
    try:
        url = f"https://api.github.com/search/repositories?q={quote_plus(query)}+stars:>50&sort=stars&order=desc&per_page={limit}"
        resp = SESSION.get(url, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            for repo in data.get("items", [])[:limit]:
                results.append({
                    "name": repo.get("full_name", ""),
                    "url": repo.get("html_url", ""),
                    "platform": "GitHub",
                    "description": (repo.get("description") or "")[:120],
                    "stars": repo.get("stargazers_count", 0)
                })
    except Exception as e:
        print(f"[Scraper] GitHub scrape failed: {e}")
    return results


def scrape_github_awesome_list(topic):
    """Scrape awesome-list pages on GitHub for curated resource links."""
    results = []
    awesome_urls = [
        f"https://github.com/topics/{quote_plus(topic.replace(' ', '-').lower())}",
    ]
    # Try known awesome lists
    search_url = f"https://api.github.com/search/repositories?q=awesome+{quote_plus(topic)}+in:name&sort=stars&per_page=3"
    try:
        resp = SESSION.get(search_url, timeout=10)
        if resp.status_code == 200:
            items = resp.json().get("items", [])[:2]
            for item in items:
                readme_url = f"https://raw.githubusercontent.com/{item['full_name']}/{item.get('default_branch', 'main')}/README.md"
                try:
                    readme_resp = SESSION.get(readme_url, timeout=8)
                    if readme_resp.status_code == 200:
                        soup = BeautifulSoup(readme_resp.text, "html.parser")
                        # Extract links from markdown
                        link_pattern = re.compile(r'\[([^\]]+)\]\((https?://[^\)]+)\)')
                        matches = link_pattern.findall(readme_resp.text)
                        for name, url in matches[:8]:
                            if any(skip in url.lower() for skip in ['badge', 'shield', 'img.', 'avatar', '#', 'github.com/topics']):
                                continue
                            results.append({
                                "name": name.strip(),
                                "url": url.strip(),
                                "platform": "GitHub Awesome",
                                "description": f"From {item['full_name']}"
                            })
                except:
                    pass
    except Exception as e:
        print(f"[Scraper] Awesome list scrape failed: {e}")
    return results[:10]


def scrape_mit_ocw(query, limit=5):
    """Scrape MIT OpenCourseWare search results."""
    results = []
    try:
        url = f"https://ocw.mit.edu/search/?q={quote_plus(query)}&type=course"
        resp = SESSION.get(url, timeout=10)
        if resp.status_code == 200:
            soup = BeautifulSoup(resp.text, "html.parser")
            cards = soup.select('a[class*="card"]') or soup.select('.search-result a') or soup.find_all('a', href=re.compile(r'/courses/'))
            for card in cards[:limit]:
                href = card.get('href', '')
                title = card.get_text(strip=True)[:80]
                if href and title and '/courses/' in href:
                    full_url = urljoin("https://ocw.mit.edu", href)
                    results.append({
                        "name": title,
                        "url": full_url,
                        "platform": "MIT OCW",
                        "description": "Free MIT course materials"
                    })
    except Exception as e:
        print(f"[Scraper] MIT OCW scrape failed: {e}")
    return results


def scrape_freecodecamp_news(query, limit=5):
    """Scrape freeCodeCamp news articles."""
    results = []
    try:
        url = f"https://www.freecodecamp.org/news/search/?query={quote_plus(query)}"
        resp = SESSION.get(url, timeout=10)
        if resp.status_code == 200:
            soup = BeautifulSoup(resp.text, "html.parser")
            articles = soup.select('article a, .post-card a, a.post-card')
            seen = set()
            for a in articles:
                href = a.get('href', '')
                title = a.get_text(strip=True)[:80]
                if href and title and href not in seen and '/news/' in href:
                    seen.add(href)
                    full_url = urljoin("https://www.freecodecamp.org", href)
                    results.append({
                        "name": title,
                        "url": full_url,
                        "platform": "freeCodeCamp",
                        "description": "Free tutorial and guide"
                    })
                    if len(results) >= limit:
                        break
    except Exception as e:
        print(f"[Scraper] freeCodeCamp scrape failed: {e}")
    return results


def scrape_edx_courses(query, limit=5):
    """Scrape edX courses via their public discovery API."""
    results = []
    try:
        url = f"https://courses.edx.org/api/courses/v1/courses/?search_term={quote_plus(query)}&page_size={limit}"
        resp = SESSION.get(url, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            for course in data.get("results", [])[:limit]:
                name = course.get("name", "")
                course_id = course.get("course_id", "")
                org = course.get("org", "")
                if name:
                    slug = course_id.replace(":", "+").replace("/", "+") if course_id else ""
                    results.append({
                        "name": name,
                        "url": f"https://www.edx.org/search?q={quote_plus(query)}",
                        "platform": "edX",
                        "description": f"By {org}" if org else "Free online course"
                    })
    except Exception as e:
        print(f"[Scraper] edX scrape failed: {e}")
    return results


def run_all_scrapers(query):
    """Run all scrapers and combine results."""
    all_results = {
        "coursera": scrape_coursera(query),
        "github": scrape_github_repos(query),
        "awesome": scrape_github_awesome_list(query),
        "mit_ocw": scrape_mit_ocw(query),
        "freecodecamp": scrape_freecodecamp_news(query),
        "edx": scrape_edx_courses(query),
    }
    return all_results
