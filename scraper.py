from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium_stealth import stealth
import time
from bs4 import BeautifulSoup
import json

# Set up Chrome options to avoid bot detection
chrome_options = Options()
chrome_options.add_argument("--headless")  # Run without opening a window
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--disable-dev-shm-usage")
chrome_options.add_argument("--disable-blink-features=AutomationControlled")  # Helps avoid detection

# Launch Chrome WebDriver
service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service, options=chrome_options)

# Apply stealth settings
stealth(driver,
    languages=["en-US", "en"],
    vendor="Google Inc.",
    platform="Win32",
    webgl_vendor="Intel Inc.",
    renderer="Intel Iris OpenGL Engine",
    fix_hairline=True,
)

# Load the page
URL = "https://www.criterion.com/shop/browse/list?sort=year&decade=2020s,2010s,2000s,1990s,1980s&direction=desc"
driver.get(URL)

# Wait for page to load
time.sleep(5)

# Extract page source
soup = BeautifulSoup(driver.page_source, "html.parser")

# Close the browser
driver.quit()

# Scrape movie data
movies = []
for item in soup.find_all("tr", class_="gridFilm"):
    title_tag = item.find("td", class_="g-title")
    img_tag = item.find("td", class_="g-img").find("img")

    if title_tag and img_tag:
        title = title_tag.text.strip()
        poster = img_tag["src"]

        movies.append({
            "title": title,
            "poster": poster
        })

# Save to JSON
with open("criterion_movies.json", "w") as f:
    json.dump(movies, f, indent=4)

print("Scraping complete! Data saved to criterion_movies.json")
