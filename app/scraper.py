from dotenv import load_dotenv
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium_stealth import stealth
import time
from bs4 import BeautifulSoup
import requests

from .config.config import OMDB_API_KEY
from .config.database import engine, get_db
from app import models
from app.models import Movie

# Create the database tables if they don't exist
models.Base.metadata.create_all(bind=engine)

# Load the .env file
load_dotenv()

def get_imdb_id(movie_title: str):
    """
    Fetch the IMDb ID from OMDb for a given movie title.
    Returns None if not found.
    """
    omdb_url = f"http://www.omdbapi.com/?apikey={OMDB_API_KEY}&t={movie_title.replace(' ', '+')}"
    response = requests.get(omdb_url)
    data = response.json()
    
    if data.get("Response") == "True" and "imdbID" in data:
        return data["imdbID"]
    return None

def configure_driver() -> webdriver.Chrome:
    """
    Configure and return a headless Chrome WebDriver instance with stealth settings.
    """
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")

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
    return driver

def fetch_page_soup(driver: webdriver.Chrome, url: str) -> BeautifulSoup:
    """
    Given a WebDriver and URL, navigate there, wait, and return the page's BeautifulSoup.
    """
    driver.get(url)
    # Wait for the page to load (adjust if needed)
    time.sleep(5)
    return BeautifulSoup(driver.page_source, "html.parser")

def parse_movie_info(item) -> dict:
    """
    Given a BeautifulSoup element representing a movie row,
    extract the relevant data (title, poster, year, director, country).

    Returns a dict if valid data is found, otherwise None.
    """
    title_tag = item.find("td", class_="g-title")
    img_tag = item.find("td", class_="g-img").find("img")
    year_tag = item.find("td", class_="g-year")
    director_tag = item.find("td", class_="g-director")
    country_tag = item.find("td", class_="g-country")

    if not (title_tag and img_tag and year_tag):
        return None  # Missing critical info, skip

    title = title_tag.text.strip()
    poster = img_tag["src"]
    year = year_tag.text.strip()
    director = director_tag.text.strip()
    country = country_tag.text.strip()

    return {
        "title": title,
        "poster": poster,
        "year": year,
        "director": director,
        "country": country
    }

def store_movie_in_db(db_session, movie_data: dict):
    """
    Given a SQLAlchemy session and a dict of movie data,
    fetch (or generate) an IMDb ID, then insert/update the database record.
    """
    title = movie_data["title"]
    poster = movie_data["poster"]
    year = movie_data["year"]
    director = movie_data["director"]
    country = movie_data["country"]

    # Fetch IMDb ID from OMDb
    imdb_id = get_imdb_id(title)

    existing_movie = None

    # Skip if any required field is missing or invalid
    if not all([imdb_id, title, poster, year, director, country]):
        print(f"Skipping movie due to missing data: {movie_data}")
        return  # Skip this movie

    # Check if the movie already exists in the database
    existing_movie = db_session.query(Movie).filter_by(imdb_id=imdb_id).first()

    if not existing_movie:
        new_movie = Movie(
            imdb_id=imdb_id,
            title=title,
            poster=poster,
            year=year,
            director=director,
            country=country
        )
        db_session.add(new_movie)
        db_session.commit()

def scrape_criterion():
    """
    Scrape Criterion website, retrieve movie data,
    and store/update it in the database.
    """
    driver = configure_driver()
    url = "https://www.criterion.com/shop/browse/list?sort=year&decade=2020s,2010s,2000s,1990s,1980s&direction=desc"

    # Fetch and parse the page
    soup = fetch_page_soup(driver, url)
    # Close the browser
    driver.quit()

    # Create a new database session
    db_session = next(get_db())

    # Iterate through all movie rows
    for item in soup.find_all("tr", class_="gridFilm"):
        movie_data = parse_movie_info(item)
        if movie_data:
            store_movie_in_db(db_session, movie_data)

    print("Scraping complete! Data is now in the database.")

if __name__ == "__main__":
    scrape_criterion()