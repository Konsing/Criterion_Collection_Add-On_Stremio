import requests
from bs4 import BeautifulSoup
import json

URL = "https://www.criterion.com/shop/browse/list?sort=year&decade=2020s,2010s,2000s,1990s,1980s&direction=desc"

def scrape_criterion_movies():
    response = requests.get(URL)
    soup = BeautifulSoup(response.text, "html.parser")
    
    movies = []
    for item in soup.find_all("li", class_="poster-container"):
        title = item.img["alt"]
        poster = item.img["src"]

        movies.append({
            "title": title,
            "poster": poster
        })

    with open("criterion_movies.json", "w") as f:
        json.dump(movies, f, indent=4)

    print("Scraping complete! Data saved to criterion_movies.json")

scrape_criterion_movies()
