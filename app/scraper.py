import os
import time
import json
import re  # Added for regex processing
import requests
from dotenv import load_dotenv
from bs4 import BeautifulSoup

# Selenium imports
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium_stealth import stealth

# Load environment
load_dotenv()
OMDB_API_KEY = os.getenv("OMDB_API_KEY")

if not OMDB_API_KEY:
    raise ValueError("OMDB_API_KEY missing in .env")

# Setup Selenium
chrome_options = Options()
chrome_options.add_argument("--headless")
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--disable-dev-shm-usage")

service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service, options=chrome_options)

stealth(
    driver,
    languages=["en-US", "en"],
    vendor="Google Inc.",
    platform="Win32",
    webgl_vendor="Intel Inc.",
    renderer="Intel Iris OpenGL Engine",
    fix_hairline=True,
)

# Load Criterion page
URL = "https://www.criterion.com/shop/browse/list?sort=year&decade=2020s,2010s,2000s,1990s,1980s&direction=desc"
driver.get(URL)
time.sleep(3)

# Scroll to load all films
prev_height = 0
while True:
    driver.find_element("tag name", "body").send_keys(Keys.END)
    time.sleep(2)
    new_height = driver.execute_script("return document.body.scrollHeight")
    if new_height == prev_height:
        break
    prev_height = new_height

soup = BeautifulSoup(driver.page_source, "html.parser")
driver.quit()

# OMDb helper function
def fetch_omdb_data(title, year):
    base_url = "http://www.omdbapi.com/"
    params1 = {"apikey": OMDB_API_KEY, "t": title, "y": year}
    r1 = requests.get(base_url, params=params1)
    d1 = r1.json()
    if d1.get("Response") == "True":
        return d1

    params2 = {"apikey": OMDB_API_KEY, "t": title}
    r2 = requests.get(base_url, params=params2)
    d2 = r2.json()
    if d2.get("Response") == "True":
        return d2

    return None

# Scrape films
movies = []
missing_movies = []

rows = soup.find_all("tr", class_="gridFilm")

for row in rows:
    title_td = row.find("td", class_="g-title")
    img_td = row.find("td", class_="g-img")
    director_td = row.find("td", class_="g-director")
    year_td = row.find("td", class_="g-year")

    if not (title_td and img_td and director_td and year_td):
        continue

    # Clean title and year data
    raw_title = title_td.get_text(strip=True)
    title = re.sub(r'\s*\(.*?\)\s*', '', raw_title).strip()
    director = director_td.get_text(strip=True)
    year_raw = year_td.get_text(strip=True)
    year_match = re.search(r'\d{4}', year_raw)
    year = year_match.group(0) if year_match else year_raw

    # Extract poster
    img = img_td.find("img")
    poster = img["src"] if img else None

    # Get OMDb data
    omdb_json = fetch_omdb_data(title, year)

    if omdb_json:
        imdb_id = omdb_json.get("imdbID")
        overview = omdb_json.get("Plot", "No overview available.")
        imdb_rating = omdb_json.get("imdbRating", "N/A")
        runtime = omdb_json.get("Runtime", "Unknown")
        genre = omdb_json.get("Genre", "Unknown")
        cast_str = omdb_json.get("Actors", "")
        cast = cast_str.split(", ") if cast_str else []

        if not poster and "Poster" in omdb_json:
            poster = omdb_json["Poster"]
    else:
        imdb_id = None
        overview = "No overview available."
        imdb_rating = "N/A"
        runtime = "Unknown"
        genre = "Unknown"
        cast = []
        missing_movies.append({"title": title, "year": year, "director": director})

    movies.append({
        "id": imdb_id,
        "title": title,
        "poster": poster,
        "year": year,
        "director": director,
        "overview": overview,
        "imdb_rating": imdb_rating,
        "runtime": runtime,
        "genre": genre,
        "cast": cast  # New cast field
    })

# Save results
with open("criterion_movies.json", "w", encoding="utf-8") as f:
    json.dump(movies, f, indent=4, ensure_ascii=False)

with open("missing_movies.json", "w", encoding="utf-8") as f:
    json.dump(missing_movies, f, indent=4, ensure_ascii=False)

print(f"✅ Done! {len(movies)} films saved to criterion_movies.json.")
print(f"❌ Missing films: {len(missing_movies)} (check missing_movies.json)")