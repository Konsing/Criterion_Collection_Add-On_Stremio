import requests
from bs4 import BeautifulSoup
import json

# URL of the webpage containing the Top 100 Criterion Films
URL = "https://letterboxd.com/dave/list/the-criterion-collection-top-100/"

def scrape_criterion_movies():
    response = requests.get(URL)
    soup = BeautifulSoup(response.text, "html.parser")
    
    movies = []
    for item in soup.find_all("li", class_="poster-container"):
        title = item.img["alt"]  # Movie title from the image alt attribute
        poster = item.img["src"]  # Poster URL
        link = "https://letterboxd.com" + item.a["href"]  # Movie's Letterboxd page
        
        movies.append({
            "title": title,
            "poster": poster,
            "link": link
        })

    # Save the scraped data as JSON
    with open("criterion_movies.json", "w") as f:
        json.dump(movies, f, indent=4)

    print("Scraping complete! Data saved to criterion_movies.json")

scrape_criterion_movies()
