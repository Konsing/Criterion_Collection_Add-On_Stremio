from flask import Flask, jsonify
import json
from flask_cors import CORS

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for cross-origin requests

# Load movies from JSON file
try:
    with open("criterion_movies.json", "r", encoding="utf-8") as f:
        movies = json.load(f)
except FileNotFoundError:
    movies = []  # Empty list if file is missing

### **1️⃣ Route: Get All Criterion Movies**
@app.route("/criterion-movies", methods=["GET"])
def get_movies():
    return jsonify(movies)

### **2️⃣ Route: Manifest for Stremio**
@app.route("/manifest.json")
def manifest():
    return jsonify({
        "id": "stremio-criterion",
        "version": "1.0.0",
        "name": "Criterion Collection",
        "description": "Lists the Criterion Collection Movies",
        "types": ["movie"],
        "idPrefixes": ["tt"],
        "resources": ["catalog", "meta"]
    })

### **3️⃣ Route: Catalog of Movies (for Stremio)**
@app.route("/catalog/movie/criterion.json")
def catalog():
    return jsonify({
        "metas": [
            {
                "id": movie["title"].lower().replace(" ", "-"),
                "name": movie["title"],
                "poster": movie["poster"],
                "description": "A film from the Criterion Collection."
            } for movie in movies
        ]
    })

### **4️⃣ Route: Get Metadata for a Specific Movie**
@app.route("/meta/movie/<movie_id>.json")
def meta(movie_id):
    for movie in movies:
        if movie_id == movie["title"].lower().replace(" ", "-"):
            return jsonify({
                "meta": {
                    "id": movie_id,
                    "name": movie["title"],
                    "poster": movie["poster"],
                    "description": "A film from the Criterion Collection."
                }
            })
    return jsonify({"error": "Movie not found"}), 404  # Return 404 if not found

# **Run the Flask app**
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
