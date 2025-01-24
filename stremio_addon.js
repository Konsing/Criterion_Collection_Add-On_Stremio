const { addonBuilder } = require("stremio-addon-sdk");
const fs = require("fs");
const path = require("path");

// ✅ Load movies dynamically every time
const loadMovies = () => {
    try {
        const filePath = path.resolve(__dirname, "criterion_movies.json");
        if (!fs.existsSync(filePath)) {
            console.error("❌ Error: criterion_movies.json not found!");
            return [];
        }
        return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch (err) {
        console.error("❌ Error reading criterion_movies.json:", err);
        return [];
    }
};

// ✅ Ensure movies are loaded fresh for each request
const getMoviesCatalog = () => {
    const movies = loadMovies();
    return movies.map(movie => ({
        "id": movie.id || movie.title.toLowerCase().replace(/\s+/g, "-"),
        "name": movie.title,
        "poster": movie.poster,
        "type": "movie",
        "description": movie.description || "A film from the Criterion Collection."
    }));
};

// Define Stremio Manifest
const manifest = {
    "id": "stremio-criterion",
    "version": "1.0.0",
    "name": "Criterion Collection",
    "description": "Lists Criterion Collection movies with metadata and posters.",
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

const builder = new addonBuilder(manifest);

// ✅ Define Catalog Handler
builder.defineCatalogHandler(({ type, id }) => {
    if (type === "movie" && id === "criterion") {
        return Promise.resolve({ metas: getMoviesCatalog() });
    }
    return Promise.reject("Not supported type");
});

// ✅ Define Meta Handler
builder.defineMetaHandler(({ id }) => {
    const movies = loadMovies();
    const movie = movies.find(m => m.id === id || id === m.title.toLowerCase().replace(/\s+/g, "-"));

    if (movie) {
        return Promise.resolve({
            "meta": {
                "id": movie.id || id,
                "name": movie.title,
                "poster": movie.poster,
                "type": "movie",
                "description": movie.description || "A film from the Criterion Collection."
            }
        });
    }
    return Promise.reject("Not found");
});

// ✅ Export for Vercel (Serverless API)
module.exports = (req, res) => {
    try {
        const interface = builder.getInterface();
        return interface(req, res);
    } catch (err) {
        console.error("❌ Server error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

console.log("✅ Stremio Add-on is running on Vercel!");
