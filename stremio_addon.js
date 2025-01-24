const { addonBuilder } = require("stremio-addon-sdk");
const fetch = require("node-fetch");

// Function to dynamically fetch movie data from Vercel's API folder
async function loadMovies() {
    try {
        const response = await fetch("https://your-vercel-app.vercel.app/api/criterion_movies.json");
        if (!response.ok) throw new Error("Failed to fetch movie data");
        return await response.json();
    } catch (error) {
        console.error("Error fetching movies:", error);
        return [];
    }
}

// Define the Stremio manifest
const manifest = {
    "id": "stremio-criterion",
    "version": "1.0.0",
    "name": "Criterion Collection",
    "description": "Lists Criterion Collection movies with metadata and posters.",
    "resources": ["catalog", "meta"],
    "types": ["movie"],
    "idPrefixes": ["tt"],  // Ensure this matches IMDb ID prefix
    "catalogs": [
        {
            "type": "movie",
            "id": "criterion",
            "name": "Criterion Collection"
        }
    ]
};

// Build the Stremio Add-on
const builder = new addonBuilder(manifest);

// Define the catalog handler (Loads movies dynamically)
builder.defineCatalogHandler(async ({ type, id }) => {
    if (type === "movie" && id === "criterion") {
        const movies = await loadMovies();  // Fetch latest movies
        const catalog = movies.map(movie => ({
            "id": movie.id,
            "name": movie.title,
            "poster": movie.poster,
            "type": "movie",
            "description": movie.description || "A film from the Criterion Collection."
        }));
        return Promise.resolve({ metas: catalog });
    }
    return Promise.reject("Not supported type");
});

// Define the meta handler (Fetches movie details dynamically)
builder.defineMetaHandler(async ({ id }) => {
    const movies = await loadMovies();  // Fetch latest movies
    const movie = movies.find(m => m.id === id || id === m.title.toLowerCase().replace(/\s+/g, "-"));
    
    if (movie) {
        return Promise.resolve({
            "meta": {
                "id": movie.id,
                "name": movie.title,
                "poster": movie.poster,
                "type": "movie",
                "description": movie.description || "A film from the Criterion Collection."
            }
        });
    }
    return Promise.reject("Not found");
});

// ✅ API Route for Vercel (Handles requests properly)
module.exports = async (req, res) => {
    const { pathname } = new URL(req.url, `http://${req.headers.host}`);

    if (pathname === "/manifest.json") {
        return res.json(builder.getInterface().manifest);
    } else if (pathname.startsWith("/catalog/movie/criterion.json")) {
        const movies = await loadMovies();
        const catalog = movies.map(movie => ({
            "id": movie.id,
            "name": movie.title,
            "poster": movie.poster,
            "type": "movie",
            "description": movie.description || "A film from the Criterion Collection."
        }));
        return res.json({ metas: catalog });
    } else if (pathname.startsWith("/meta/movie/")) {
        const movies = await loadMovies();
        const id = pathname.split("/").pop().replace(".json", "");
        const movie = movies.find(m => m.id === id);

        if (movie) {
            return res.json({
                meta: {
                    id: movie.id,
                    name: movie.title,
                    poster: movie.poster,
                    type: "movie",
                    description: movie.description || "A film from the Criterion Collection."
                }
            });
        }
        return res.status(404).json({ error: "Movie not found" });
    }

    res.status(404).json({ error: "Not found" });
};
