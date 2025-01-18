from flask import Flask, jsonify
import json

app = Flask(__name__)

with open("criterion_movies.json", "r") as f:
    movies = json.load(f)

@app.route("/criterion-movies", methods=["GET"])
def get_movies():
    return jsonify(movies)

@app.route("/manifest.json")
def manifest():
    return jsonify({
        "id": "stremio-criterion",
        "version": "1.0.0",
        "name": "Criterion Collection",
        "description": "Lists the Top 100 Criterion Films",
        "types": ["movie"],
        "idPrefixes": ["tt"],
        "resources": ["catalog", "meta"]
    })

@app.route("/catalog/movie/criterion.json")
def catalog():
    return jsonify({
        "metas": [
            {
                "id": movie["title"].lower().replace(" ", "-"),
                "name": movie["title"],
                "poster": movie["poster"],
                "description": "A film from the Criterion Top 100 Collection."
            } for movie in movies
        ]
    })

@app.route("/meta/movie/<movie_id>.json")
def meta(movie_id):
    for movie in movies:
        if movie_id == movie["title"].lower().replace(" ", "-"):
            return jsonify({
                "meta": {
                    "id": movie_id,
                    "name": movie["title"],
                    "poster": movie["poster"],
                    "description": "A film from the Criterion Top 100 Collection."
                }
            })
    return jsonify({})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
