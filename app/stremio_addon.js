const { addonBuilder } = require("stremio-addon-sdk");
const fs = require("fs");

// Load movies from JSON
let movies = [];
try {
    movies = JSON.parse(fs.readFileSync("criterion_movies.json", "utf-8"));
} catch (err) {
    console.error("Error reading criterion_movies.json:", err);
}

// Define the Stremio manifest
const manifest = {
    "id": "stremio-criterion",
    "version": "1.0.0",
    "name": "Criterion Collection",
    "description": "Lists Criterion Collection movies with metadata, ratings, and posters.",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/5/5d/The_Criterion_Collection_Logo.svg",
    "resources": ["catalog", "meta"],
    "types": ["movie"],
    "idPrefixes": ["tt"],
    "catalogs": [
        {
            "type": "movie",
            "id": "criterion",
            "name": "Criterion Collection"
        }
    ]
};

// 🎬 Catalog Meta Configuration
const catalog = movies.map(movie => ({
    "id": movie.id,
    "name": movie.title,
    "poster": movie.poster,
    "type": "movie",
    "description": movie.overview || "A film from the Criterion Collection.",
    "releaseInfo": movie.year || "Unknown",
    "runtime": movie.runtime !== "Unknown" ? movie.runtime : "N/A",
    "background": movie.poster,
    "logo": movie.id ? `https://images.metahub.space/logo/medium/${movie.id}/img` : undefined,
    "genres": movie.genre !== "Unknown" ? movie.genre.split(", ") : [],
    "imdbRating": movie.imdb_rating !== "N/A" ? parseFloat(movie.imdb_rating).toFixed(1) : undefined, // IMDb rating as string
}));

// Build the Stremio Add-on
const builder = new addonBuilder(manifest);

// 📌 Catalog Handler
builder.defineCatalogHandler(({ type, id }) => {
    if (type === "movie" && id === "criterion") {
        return Promise.resolve({ metas: catalog });
    }
    return Promise.reject("Not supported type");
});

// 📌 Meta View Handler (Corrected Schema)
builder.defineMetaHandler(({ id }) => {
    const movie = movies.find(m => m.id === id);

    if (movie) {
        return Promise.resolve({
            "meta": {
                "id": movie.id,
                "name": movie.title,
                "poster": movie.poster,
                "type": "movie",
                "description": movie.overview || "A film from the Criterion Collection.",
                "runtime": movie.runtime || "N/A",
                "releaseInfo": movie.year || "Unknown",
                "background": movie.poster,
                "logo": movie.id ? `https://images.metahub.space/logo/medium/${movie.id}/img` : undefined,
                "imdbRating": movie.imdb_rating !== "N/A" ? parseFloat(movie.imdb_rating).toFixed(1) : undefined, // IMDb rating as string
                "genres": movie.genre !== "Unknown" ? movie.genre.split(", ") : [],
                "trailer": movie.trailer || undefined,
            }
        });
    }
    return Promise.reject("Not found");
});

// Serve the add-on
const addonInterface = builder.getInterface();
const { serveHTTP } = require("stremio-addon-sdk");

serveHTTP(addonInterface, { port: 7000 });

console.log("✅ Stremio Addon running on http://localhost:7000/manifest.json");