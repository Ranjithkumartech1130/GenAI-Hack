"""
Curriculum Builder — Generates structured markdown curriculum
from curated database + live web scraping results.
No API keys needed. All links are real.
"""

from curated_db import CURATED, GENERIC_RESOURCES, match_topic
from scraper import run_all_scrapers


def build_essential_table(topic_data, scraped, goal):
    """Build the Essential Resources markdown table."""
    rows = []
    # Use curated essential resources first
    essentials = topic_data.get("essential", GENERIC_RESOURCES["essential"])
    for r in essentials[:10]:
        rows.append(f'| **{r["name"]}** | [{r["name"]}]({r["url"]}) | {r["why"]} |')
    
    # Add scraped Coursera courses if curated doesn't have enough
    if len(rows) < 8:
        for c in scraped.get("coursera", [])[:3]:
            rows.append(f'| **{c["name"]}** | [{c["name"]}]({c["url"]}) | {c["description"]} (Coursera) |')
    
    table = "| 🎓 **Platform / Course** | 🔗 **Link** | 💡 **Why This Matters** |\n"
    table += "| :--- | :--- | :--- |\n"
    table += "\n".join(rows)
    return table


def build_phase(phase_data, phase_num, phase_name, phase_icon, weeks):
    """Build a single phase section."""
    md = f"\n### {phase_icon} Phase {phase_num}: {phase_name} ({weeks})\n\n"
    md += f'**🎯 Focus:** {phase_data["focus"]}\n\n'
    md += "**📖 Key Resources:**\n"
    for r in phase_data["resources"]:
        md += f'- {r["e"]} **[{r["n"]}]({r["u"]})** - {r["d"]}\n'
    md += f'\n**🏁 {"Capstone" if phase_num == 3 else "Milestone"} Project:** {phase_data["project"]}\n'
    return md


def build_tracks(tracks):
    """Build specialized learning paths section."""
    md = ""
    for i, track in enumerate(tracks, 1):
        md += f'\n### Track {i}: {track["name"]}\n'
        for item in track["items"]:
            md += f'- 📌 **[{item["n"]}]({item["u"]})** - {item["d"]}\n'
    return md


def build_tools_table(tools):
    """Build the Essential Tools & Frameworks table."""
    table = "| 🔧 **Tool** | 🔗 **Link** | 💡 **Purpose** |\n"
    table += "| :--- | :--- | :--- |\n"
    for t in tools:
        table += f'| **{t["n"]}** | [{t["n"]}]({t["u"]}) | {t["p"]} |\n'
    return table


def build_scraped_bonus(scraped, goal):
    """Build bonus section from scraped web results."""
    md = ""
    
    # GitHub repos
    repos = scraped.get("github", [])
    if repos:
        md += "\n## 🐙 Trending GitHub Repositories\n\n"
        for r in repos[:5]:
            stars = f" ⭐ {r.get('stars', 0):,}" if r.get('stars') else ""
            md += f'- **[{r["name"]}]({r["url"]})**{stars} — {r["description"]}\n'
    
    # Awesome list resources
    awesome = scraped.get("awesome", [])
    if awesome:
        md += "\n## ⭐ Community-Curated Resources\n\n"
        for r in awesome[:6]:
            md += f'- **[{r["name"]}]({r["url"]})** — {r["description"]}\n'
    
    # Additional Coursera courses
    coursera = scraped.get("coursera", [])
    if coursera:
        md += "\n## 🎓 Live Courses Found\n\n"
        md += "| Course | Platform | Description |\n| :--- | :--- | :--- |\n"
        for c in coursera[:5]:
            md += f'| **[{c["name"]}]({c["url"]})** | {c["platform"]} | {c["description"]} |\n'
    
    return md


def generate_curriculum(goal, experience_level="Beginner", skills=None, use_previous=True):
    """
    Generate a complete structured learning curriculum.
    Uses curated database + live web scraping. No API keys needed.
    Returns markdown string.
    """
    skills = skills or []
    
    # 1. Match goal to curated topic
    topic_key, score = match_topic(goal)
    
    # 2. Run web scrapers for live data
    try:
        scraped = run_all_scrapers(goal)
    except Exception as e:
        print(f"[CurriculumBuilder] Scraping failed: {e}")
        scraped = {}
    
    # 3. Build curriculum
    if topic_key and score > 0:
        topic = CURATED[topic_key]
        title = topic.get("title", goal)
    else:
        # Unknown topic — use scraped data + generic structure
        title = goal
        topic = None
    
    # Skill context
    skill_note = ""
    if use_previous and skills:
        skill_note = f" Based on your existing skills ({', '.join(skills[:5])}), this path is optimized to accelerate your journey."
    
    # ===== BUILD MARKDOWN =====
    md = f"# 🚀 Your Personalized Curriculum: {goal}\n\n"
    md += f"> 🤖 **AI Assistant Note:** I've curated a personalized, beginner-friendly learning roadmap for **{goal}** "
    md += f"based on your experience level ({experience_level}).{skill_note} "
    md += "This structured path includes the best free & open-source resources, phased learning modules, milestone projects, and specialized tracks.\n"
    md += "\n---\n"
    
    # Essential Resources Table
    if topic:
        md += f"\n## 📚 Essential {title} Resources\n\n"
        md += build_essential_table(topic, scraped, goal)
    else:
        md += f"\n## 📚 Essential {goal} Resources\n\n"
        md += build_essential_table({"essential": GENERIC_RESOURCES["essential"]}, scraped, goal)
        # Add scraped courses for unknown topics
        coursera = scraped.get("coursera", [])
        if coursera:
            for c in coursera[:5]:
                md += f'\n| **{c["name"]}** | [{c["name"]}]({c["url"]}) | {c["description"]} |'
    
    md += "\n\n---\n"
    
    # Detailed Learning Modules
    md += "\n## 🗂️ Detailed Learning Modules\n"
    
    if topic:
        md += build_phase(topic["phase1"], 1, "Foundations & Core Concepts", "📘", "Weeks 1-8")
        md += "\n---\n"
        md += build_phase(topic["phase2"], 2, "Core Expertise & Advanced Concepts", "📗", "Weeks 9-16")
        md += "\n---\n"
        md += build_phase(topic["phase3"], 3, "Advanced Mastery & Specialization", "📙", "Weeks 17-24")
    else:
        # Generic phases with scraped resources
        md += _build_generic_phases(goal, scraped)
    
    md += "\n\n---\n"
    
    # Specialized Learning Paths
    md += "\n## 🎯 Specialized Learning Paths\n"
    if topic and "tracks" in topic:
        md += build_tracks(topic["tracks"])
    else:
        md += _build_generic_tracks(goal, scraped)
    
    md += "\n\n---\n"
    
    # Essential Tools & Frameworks
    md += "\n## 🛠️ Essential Tools & Frameworks\n\n"
    if topic and "tools" in topic:
        md += build_tools_table(topic["tools"])
    else:
        md += build_tools_table(GENERIC_RESOURCES["tools"])
    
    # Scraped bonus content
    bonus = build_scraped_bonus(scraped, goal)
    if bonus:
        md += "\n---\n" + bonus
    
    md += "\n\n---\n\n"
    md += f"**✨ Remember:** Every expert was once a beginner. Stay consistent, build projects, and engage with the community. Good luck on your {goal} journey! 🚀\n"
    
    return md


def _build_generic_phases(goal, scraped):
    """Build generic phases when no curated topic matches — packed with real links."""
    coursera = scraped.get("coursera", [])
    github = scraped.get("github", [])
    fcc = scraped.get("freecodecamp", [])
    edx = scraped.get("edx", [])
    mit = scraped.get("mit_ocw", [])
    awesome = scraped.get("awesome", [])
    
    q = goal.replace(" ", "+")
    qd = goal.replace(" ", "-").lower()
    
    # === PHASE 1 ===
    md = f"\n### 📘 Phase 1: Foundations & Core Concepts (Weeks 1-8)\n\n"
    md += f"**🎯 Focus:** Build strong fundamentals in {goal}\n\n"
    md += "**📖 Key Resources:**\n"
    
    # Coursera search link (always works)
    md += f'- 📚 **[Coursera — {goal} Courses](https://www.coursera.org/search?query={q})** - University-level courses (audit free)\n'
    
    # Real scraped Coursera courses
    for c in coursera[:2]:
        md += f'- 🎓 **[{c["name"]}]({c["url"]})** - {c["description"]} (Coursera)\n'
    
    # edX search link
    md += f'- 🌐 **[edX — {goal} Courses](https://www.edx.org/search?q={q})** - Free courses from MIT, Harvard & more\n'
    
    # Real scraped edX courses
    for c in edx[:2]:
        md += f'- 🎯 **[{c["name"]}]({c["url"]})** - {c["description"]} (edX)\n'
    
    # MIT OCW
    md += f'- 🏛️ **[MIT OpenCourseWare — {goal}](https://ocw.mit.edu/search/?q={q})** - Free MIT course materials\n'
    for c in mit[:2]:
        md += f'- 📖 **[{c["name"]}]({c["url"]})** - Free MIT course materials\n'
    
    # Khan Academy & freeCodeCamp
    md += f'- 📐 **[Khan Academy](https://www.khanacademy.org/search?page_search_query={q})** - Free education for all subjects\n'
    md += f'- 💻 **[freeCodeCamp](https://www.freecodecamp.org/news/search/?query={q})** - Free coding bootcamp & certifications\n'
    
    # YouTube
    md += f'- 🎥 **[YouTube — {goal} Tutorials](https://www.youtube.com/results?search_query={q}+tutorial+for+beginners)** - Free video tutorials\n'
    
    md += f'\n**🏁 Milestone Project:** Complete a foundational project demonstrating core {goal} concepts\n'
    
    # === PHASE 2 ===
    md += f"\n---\n\n### 📗 Phase 2: Core Expertise & Skill Development (Weeks 9-16)\n\n"
    md += f"**🎯 Focus:** Develop practical skills and build projects in {goal}\n\n"
    md += "**📖 Key Resources:**\n"
    
    # Remaining Coursera courses
    for c in coursera[2:5]:
        md += f'- 📖 **[{c["name"]}]({c["url"]})** - {c["description"]} (Coursera)\n'
    
    # Udemy search
    md += f'- 🎯 **[Udemy — {goal} Courses](https://www.udemy.com/courses/search/?q={q})** - Practical, project-based courses\n'
    
    # GitHub repos
    for r in github[:3]:
        stars = f" ⭐ {r.get('stars', 0):,}" if r.get('stars') else ""
        md += f'- 🐙 **[{r["name"]}]({r["url"]})**{stars} — {r["description"]}\n'
    
    # Awesome list resources
    for r in awesome[:3]:
        md += f'- ⭐ **[{r["name"]}]({r["url"]})** — {r["description"]}\n'
    
    # If no scraped content fell through, add search links
    if not coursera[2:5] and not github[:3]:
        md += f'- 📚 **[Udemy — {goal}](https://www.udemy.com/courses/search/?q={q})** - Practical courses\n'
        md += f'- 🔍 **[YouTube — {goal} Intermediate](https://www.youtube.com/results?search_query={q}+intermediate+tutorial)** - Video tutorials\n'
        md += f'- 🏗️ **[GitHub Topics — {goal}](https://github.com/topics/{qd})** - Open source projects & repos\n'
    
    md += f'\n**🏁 Milestone Project:** Build an intermediate {goal} project with real-world application\n'
    
    # === PHASE 3 ===
    md += f"\n---\n\n### 📙 Phase 3: Advanced Mastery & Specialization (Weeks 17-24)\n\n"
    md += f"**🎯 Focus:** Production-level skills, deployment, and specialization in {goal}\n\n"
    md += "**📖 Key Resources:**\n"
    
    # Advanced GitHub repos
    for r in github[3:6]:
        stars = f" ⭐ {r.get('stars', 0):,}" if r.get('stars') else ""
        md += f'- 🚀 **[{r["name"]}]({r["url"]})**{stars} — {r["description"]}\n'
    
    # freeCodeCamp articles
    for r in fcc[:3]:
        md += f'- 📝 **[{r["name"]}]({r["url"]})** - {r["description"]}\n'
    
    # More awesome list resources
    for r in awesome[3:6]:
        md += f'- ⭐ **[{r["name"]}]({r["url"]})** — {r["description"]}\n'
    
    # Remaining edX courses
    for c in edx[2:4]:
        md += f'- 🎓 **[{c["name"]}]({c["url"]})** - {c["description"]} (edX)\n'
    
    # Fallback links if nothing scraped
    if not github[3:6] and not fcc and not awesome[3:6]:
        md += f'- 🚀 **[GitHub Topics — {goal}](https://github.com/topics/{qd})** - Open source projects\n'
        md += f'- 📊 **[LinkedIn Learning — {goal}](https://www.linkedin.com/learning/search?keywords={q})** - Professional development\n'
        md += f'- 🎓 **[Coursera Specializations](https://www.coursera.org/search?query={q}&index=prod_all_launched_products_term_optimization&entityTypeDescription=Specializations)** - Multi-course specialization programs\n'
    
    # Always add certification/community links
    md += f'- 🏆 **[Google Career Certificates](https://grow.google/certificates/)** - Industry-recognized certifications\n'
    md += f'- 📚 **[Skillshare — {goal}](https://www.skillshare.com/en/search?query={q})** - Creative & professional skills\n'
    
    md += f'\n**🏁 Capstone Project:** Build & deploy a comprehensive {goal} application or portfolio showcasing mastery\n'
    
    return md


def _build_generic_tracks(goal, scraped):
    """Build generic tracks for unknown topics with real links."""
    q = goal.replace(" ", "+")
    qd = goal.replace(" ", "-").lower()
    
    md = f"\n### Track 1: 📚 Deep Dive Specialization\n"
    md += f'- 📌 **[Coursera Specializations — {goal}](https://www.coursera.org/search?query={q}&index=prod_all_launched_products_term_optimization&entityTypeDescription=Specializations)** - Multi-course certificate programs\n'
    md += f'- 📌 **[edX Programs — {goal}](https://www.edx.org/search?q={q})** - University micro-credentials & MicroMasters\n'
    md += f'- 📌 **[Udacity Nanodegrees](https://www.udacity.com/courses/all)** - Career-focused intensive programs\n'
    md += f'- 📌 **[LinkedIn Learning — {goal}](https://www.linkedin.com/learning/search?keywords={q})** - Professional development paths\n'
    
    md += f"\n### Track 2: 🛠️ Hands-On Practice & Projects\n"
    md += f'- 📌 **[GitHub Topics — {goal}](https://github.com/topics/{qd})** - Open source projects to study & contribute\n'
    md += f'- 📌 **[Kaggle — {goal}](https://www.kaggle.com/search?q={q})** - Datasets & competitions\n'
    md += f'- 📌 **[HackerRank](https://www.hackerrank.com/)** - Coding challenges & practice\n'
    md += f'- 📌 **[LeetCode](https://leetcode.com/)** - Algorithm & problem solving practice\n'
    
    md += f"\n### Track 3: 🎓 Certifications & Career Growth\n"
    md += f'- 📌 **[Google Certificates](https://grow.google/certificates/)** - Google career certificates\n'
    md += f'- 📌 **[Coursera Professional Certificates](https://www.coursera.org/professional-certificates)** - Industry certifications\n'
    md += f'- 📌 **[edX Professional Certificates](https://www.edx.org/search?q={q}&tab=program)** - University-backed credentials\n'
    md += f'- 📌 **[Credly Badges](https://www.credly.com/search?query={q})** - Digital credentials & badges\n'
    
    return md

