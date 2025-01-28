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

// 🎬 **Ensure IMDb Rating, Genre, and Cast Appear in Catalog**  
const catalog = movies.map(movie => ({
    "id": movie.id,
    "name": movie.title,
    "poster": movie.poster,
    "type": "movie",
    "description": movie.overview || "A film from the Criterion Collection.",
    "releaseInfo": movie.year || "Unknown",
    "runtime": movie.runtime !== "Unknown" ? movie.runtime : "N/A",
    "background": movie.poster,  // Helps with better visuals
    
    // ✅ **Fix: Use IMDb-Styled Font Instead of Criterion Logo**
    "logo": `https://images.metahub.space/logo/medium/${movie.id}/img`,

    // ✅ IMDb Rating with Logo (Only if Available)
    "rating": movie.imdb_rating !== "N/A" ? {
        "value": parseFloat(movie.imdb_rating),
        "type": "imdb"
    } : undefined,

    // ✅ Genre Tags as Clickable Ovals
    "genre": movie.genre !== "Unknown" ? movie.genre.split(", ") : [],

    // ✅ Cast & Director (Ensuring They're Lists)
    "cast": movie.cast && movie.cast.length > 0 ? movie.cast.split(", ") : [],
    "director": movie.director ? [movie.director] : []
}));

// Build the Stremio Add-on
const builder = new addonBuilder(manifest);

// 📌 **Fixing Catalog Handler to Ensure IMDb Rating Appears**
builder.defineCatalogHandler(({ type, id }) => {
    if (type === "movie" && id === "criterion") {
        return Promise.resolve({ metas: catalog });
    }
    return Promise.reject("Not supported type");
});

// 📌 **Fixing Detailed Meta View**
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
                "runtime": movie.runtime,
                "releaseInfo": movie.year,
                "background": movie.poster,

                // ✅ **Fix: Use IMDb-Styled Font Instead of Criterion Logo**
                "logo": `https://images.metahub.space/logo/medium/${movie.id}/img`,

                // ✅ **IMDb Rating with Logo**
                "rating": movie.imdb_rating !== "N/A" ? {
                    "value": parseFloat(movie.imdb_rating),
                    "type": "imdb"
                } : undefined,

                // ✅ **Genres as clickable tags**
                "genre": movie.genre !== "Unknown" ? movie.genre.split(", ") : [],

                // ✅ **Cast & Director Display**
                "cast": movie.cast && movie.cast.length > 0 ? movie.cast.split(", ") : [],
                "director": movie.director ? [movie.director] : [],

                // ✅ **Clickable IMDb & Criterion Links**
                "links": [
                    {
                        "name": "View on IMDb",
                        "url": `https://www.imdb.com/title/${movie.id}/`
                    },
                    {
                        "name": "View on Criterion",
                        "url": movie.criterion_url || "https://www.criterion.com/"
                    }
                ]
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
