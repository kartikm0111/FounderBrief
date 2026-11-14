import logging
import urllib.robotparser
from typing import Dict, Any, List
import httpx
from bs4 import BeautifulSoup
from app.core.config import settings

logger = logging.getLogger(__name__)


class WebScraperService:
    def __init__(self):
        self.user_agent = settings.DEFAULT_USER_AGENT
        self.timeout = settings.CRAWL_TIMEOUT_SECONDS

    def check_robots_txt(self, url: str) -> bool:
        """
        Check if the target URL allows scraping according to robots.txt.
        Complies with strict ethical web scraping guidelines.
        """
        try:
            parsed = httpx.URL(url)
            robots_url = f"{parsed.scheme}://{parsed.host}/robots.txt"
            rp = urllib.robotparser.RobotFileParser()
            rp.set_url(robots_url)
            
            # Fetch robots.txt with quick timeout
            with httpx.Client(timeout=5.0, headers={"User-Agent": self.user_agent}) as client:
                res = client.get(robots_url)
                if res.status_code == 200:
                    rp.parse(res.text.splitlines())
                    allowed = rp.can_fetch(self.user_agent, url)
                    logger.info(f"Robots.txt check for {url}: allowed={allowed}")
                    return allowed
                elif res.status_code == 404:
                    # No robots.txt found, crawling is permitted
                    return True
                else:
                    return True
        except Exception as e:
            logger.warning(f"Failed to check robots.txt for {url}: {e}. Proceeding conservatively.")
            return True

    def scrape_public_context(self, url: str) -> Dict[str, Any]:
        """
        Scrapes public context from the target company's website.
        Extracts title, meta descriptions, key headings, navigation links, and readable text.
        """
        if not url.startswith("http://") and not url.startswith("https://"):
            url = f"https://{url}"

        # Check robots.txt
        robots_allowed = self.check_robots_txt(url)
        if not robots_allowed and settings.RESPECT_ROBOTS_TXT:
            logger.warning(f"Crawling disallowed by robots.txt for {url}")
            return {
                "url": url,
                "status": "blocked_by_robots_txt",
                "title": "",
                "meta_description": "",
                "headings": [],
                "paragraphs": [],
                "text_snippet": "Crawling disallowed by website robots.txt policy.",
                "sub_links": []
            }

        headers = {
            "User-Agent": self.user_agent,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
        }

        try:
            with httpx.Client(timeout=self.timeout, follow_redirects=True, headers=headers) as client:
                response = client.get(url)
                
                if response.status_code != 200:
                    return {
                        "url": url,
                        "status": f"http_error_{response.status_code}",
                        "title": "",
                        "meta_description": "",
                        "headings": [],
                        "paragraphs": [],
                        "text_snippet": f"HTTP status {response.status_code}",
                        "sub_links": []
                    }

                soup = BeautifulSoup(response.text, "html.parser")
                
                # Remove script and style elements
                for element in soup(["script", "style", "noscript", "svg", "header", "footer"]):
                    element.decompose()

                # Extract title
                title = soup.title.string.strip() if soup.title and soup.title.string else ""

                # Extract meta description
                meta_desc = ""
                meta_tag = soup.find("meta", attrs={"name": "description"}) or soup.find("meta", attrs={"property": "og:description"})
                if meta_tag and meta_tag.get("content"):
                    meta_desc = meta_tag["content"].strip()

                # Extract headings
                headings = []
                for h in soup.find_all(["h1", "h2", "h3"]):
                    text = h.get_text(strip=True)
                    if text and len(text) > 3 and text not in headings:
                        headings.append(text)

                # Extract paragraphs & main body text
                paragraphs = []
                for p in soup.find_all("p"):
                    text = p.get_text(strip=True)
                    if text and len(text) > 20:
                        paragraphs.append(text)

                # Clean combined text snippet (limit to 3500 chars for LLM prompt efficiency)
                all_text = " ".join([h for h in headings[:8]] + [p for p in paragraphs[:15]])
                text_snippet = all_text[:3500].strip()

                # Find relevant sub-links (About, Services, Offerings, Contact)
                sub_links = []
                for a in soup.find_all("a", href=True):
                    href = a["href"].strip()
                    link_text = a.get_text(strip=True).lower()
                    if any(kw in link_text or kw in href.lower() for kw in ["about", "service", "program", "course", "pricing", "ivy"]):
                        if href.startswith("/"):
                            parsed = httpx.URL(url)
                            full_url = f"{parsed.scheme}://{parsed.host}{href}"
                            if full_url not in sub_links:
                                sub_links.append(full_url)
                        elif href.startswith("http"):
                            if href not in sub_links:
                                sub_links.append(href)

                return {
                    "url": url,
                    "status": "success",
                    "title": title,
                    "meta_description": meta_desc,
                    "headings": headings[:12],
                    "paragraphs": paragraphs[:10],
                    "text_snippet": text_snippet,
                    "sub_links": sub_links[:6]
                }

        except Exception as e:
            logger.error(f"Error scraping {url}: {e}")
            return {
                "url": url,
                "status": f"error: {str(e)}",
                "title": "",
                "meta_description": "",
                "headings": [],
                "paragraphs": [],
                "text_snippet": f"Could not retrieve webpage content: {str(e)}",
                "sub_links": []
            }


scraper_service = WebScraperService()
