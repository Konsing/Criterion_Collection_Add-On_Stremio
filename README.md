# 📽️ Criterion Collection Stremio Add-on

A **Stremio add-on** that lists the **Top 100 Criterion Films** with metadata, posters, and streaming links. The add-on scrapes movie data, serves it via a **Flask API**, and integrates with **Stremio Add-on SDK** to display the films in Stremio.

---

## 📌 Features
- ✅ **Top 100 Criterion Films** listed inside Stremio.
- ✅ **Metadata Display** (Title, Poster, Letterboxd Link).
- ✅ **Simple Flask API** for serving movie data.
- ✅ **Stremio Add-on SDK Integration** for seamless Stremio support.
- ✅ **Free Hosting Options** (Can run locally or deploy on Render/Glitch).

---

## 📁 Project Structure
```
/criterion-stremio-addon
│── scraper.py             # Scrapes movie data from Letterboxd
│── criterion_movies.json  # Stores scraped movie data
│── flask_api.py           # Flask API to serve movie data
│── stremio_addon.py       # Stremio Add-on using the Stremio SDK
│── README.md              # Project documentation
```

---

## 🚀 Getting Started

### 1️⃣ Install Dependencies
Make sure you have Python installed, then install the required packages:
```sh
pip install requests beautifulsoup4 flask stremio-addon-sdk
```

---

## 🕵️‍♂️ Step 1: Scrape Criterion Movie List
This script scrapes the **Top 100 Criterion Films** from a Letterboxd list.

### 🔹 **Run the scraper:**
```sh
python scraper.py
```

### 🔹 **Scraper Code:**
```python
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
        title = item.img["alt"]
        poster = item.img["src"]
        link = "https://letterboxd.com" + item.a["href"]

        movies.append({
            "title": title,
            "poster": poster,
            "link": link
        })

    with open("criterion_movies.json", "w") as f:
        json.dump(movies, f, indent=4)

    print("Scraping complete! Data saved to criterion_movies.json")

scrape_criterion_movies()
```
This will create a `criterion_movies.json` file containing the **movie data**.

---

## 🌐 Step 2: Run the Flask API
Now, we serve the JSON data using **Flask** so that Stremio can fetch it.

### 🔹 **Run the Flask API:**
```sh
python flask_api.py
```

### 🔹 **Flask API Code:**
```python
from flask import Flask, jsonify
import json

app = Flask(__name__)

with open("criterion_movies.json", "r") as f:
    movies = json.load(f)

@app.route("/criterion-movies", methods=["GET"])
def get_movies():
    return jsonify(movies)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
```
- The **API runs on `http://localhost:5000/criterion-movies`**.
- Test it by opening that URL in a browser.

---

## 🎬 Step 3: Run the Stremio Add-on
This script integrates our Flask API with **Stremio Add-on SDK**.

### 🔹 **Run the Stremio Add-on:**
```sh
python stremio_addon.py
```

### 🔹 **Stremio Add-on Code:**
```python
from stremio_addon_sdk import Manifest, Addon
import requests

MOVIES_API_URL = "http://localhost:5000/criterion-movies"
movies = requests.get(MOVIES_API_URL).json()

manifest = Manifest(
    id="stremio-criterion",
    version="1.0.0",
    name="Criterion Collection",
    description="Lists the Top 100 Criterion Films",
    types=["movie"],
    idPrefixes=["tt"]
)

addon = Addon(manifest)

@addon.route("/meta/:type/:id.json")
def meta(type, id):
    for movie in movies:
        if id in movie["title"].lower():
            return {
                "meta": {
                    "id": id,
                    "name": movie["title"],
                    "poster": movie["poster"],
                    "description": "A film from the Criterion Top 100 Collection.",
                    "link": movie["link"]
                }
            }
    return {}

if __name__ == "__main__":
    addon.serve(port=7000)
```

---

## 📡 Step 4: Add to Stremio
1. Open **Stremio**.
2. Go to **Add-ons > Developer Mode > Add an Add-on**.
3. Enter:
   ```
   http://localhost:7000/manifest.json
   ```
4. Click **Install** and start browsing the **Criterion Collection** inside Stremio!

---

## 🔄 Hosting Options
Right now, this runs **locally**. To host it for free:
- Use **Render.com** or **Glitch** to deploy the Flask API.
- Use **GitHub Pages** for hosting static JSON data.

---

## 🎯 Next Steps
✅ **Add Filtering by Genre, Director, or Year**  
✅ **Optimize for Faster API Response**  
✅ **Improve Metadata with More Details**  

---

## ⚡ Summary
| Step  | Action |
|-------|--------|
| 1️⃣   | Scrape **Top 100 Criterion Films** using BeautifulSoup |
| 2️⃣   | Serve the data using a **Flask API** |
| 3️⃣   | Build a **Stremio Add-on** with the Stremio SDK |
| 4️⃣   | Install and use the add-on inside **Stremio** |

---

### 🚀 Need Help?
If you need help setting up filters or deploying the add-on, feel free to ask! 🎬
