const { addonBuilder } = require("stremio-addon-sdk");
const fs = require("fs");

// 1) Load Movies
let movies = [];
try {
    movies = JSON.parse(fs.readFileSync("criterion_movies.json", "utf-8"));
    console.log("✅ Loaded movies from criterion_movies.json");
} catch (err) {
    console.error("❌ Error reading criterion_movies.json:", err);
}

// 2) Manifest with Our Sort Options
//    - We'll provide the user a dropdown with year_asc, year_desc, rating_asc, etc.
const manifest = {
    id: "stremio-criterion",
    version: "2.0.0",
    name: "Criterion Collection",
    description: "Lists Criterion Collection movies with advanced sorting options.",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/5d/The_Criterion_Collection_Logo.svg",
    resources: ["catalog", "meta"],
    types: ["movie"],
    idPrefixes: ["tt"],
    catalogs: [
        {
            type: "movie",
            id: "criterion",
            name: "Criterion Collection",
            // 'extra' with only ascending/descending sorts, no "none"
            extra: [
                {
                    name: "sort",
                    options: [
                        "Year Ascending",
                        "Year Descending",
                        "Rating Ascending",
                        "Rating Descending",
                        "Runtime Ascending",
                        "Runtime Descending"
                    ],
                    isRequired: false
                }
            ]
        }
    ]
};

// 3) Sorting Function
//    - Check the chosen 'sortOption' and sort accordingly
function getSortedCatalog(sortOption) {
    const sortedMovies = [...movies];

    switch (sortOption) {
        case "Year Ascending":
            // Oldest first
            sortedMovies.sort((a, b) => (parseInt(a.year) || 0) - (parseInt(b.year) || 0));
            break;

        case "Year Descending":
            // Newest first
            sortedMovies.sort((a, b) => (parseInt(b.year) || 0) - (parseInt(a.year) || 0));
            break;

        case "Rating Ascending":
            // Lowest rating first
            sortedMovies.sort((a, b) => (parseFloat(a.imdb_rating) || 0) - (parseFloat(b.imdb_rating) || 0));
            break;

        case "Rating Descending":
            // Highest rating first
            sortedMovies.sort((a, b) => (parseFloat(b.imdb_rating) || 0) - (parseFloat(a.imdb_rating) || 0));
            break;

        case "Runtime Ascending":
            // Shortest first
            sortedMovies.sort((a, b) => {
                const ra = parseInt(a.runtime) || 0;
                const rb = parseInt(b.runtime) || 0;
                return ra - rb;
            });
            break;

        case "Runtime Descending":
            // Longest first
            sortedMovies.sort((a, b) => {
                const ra = parseInt(a.runtime) || 0;
                const rb = parseInt(b.runtime) || 0;
                return rb - ra;
            });
            break;

        default:
            // If for some reason no valid option is passed, we'll do year_desc (common default).
            console.log("No valid sort option detected, defaulting to newest first (year_desc).");
            sortedMovies.sort((a, b) => (parseInt(b.year) || 0) - (parseInt(a.year) || 0));
            break;
    }

    // Convert the sorted array to Stremio metas
    return sortedMovies.map(movie => ({
        id: movie.id,
        name: movie.title,
        poster: movie.poster,
        type: "movie",
        description: movie.overview || "A film from the Criterion Collection.",
        releaseInfo: movie.year || "Unknown",
        runtime: movie.runtime !== "Unknown" ? movie.runtime : "N/A",
        background: movie.poster,
        logo: movie.id
            ? `https://images.metahub.space/logo/medium/${movie.id}/img`
            : undefined,
        genres: movie.genre !== "Unknown"
            ? movie.genre.split(", ")
            : [],
        imdbRating: movie.imdb_rating !== "N/A"
            ? parseFloat(movie.imdb_rating).toFixed(1)
            : undefined
    }));
}

// 4) Build the Add-on
const builder = new addonBuilder(manifest);

// 5) Catalog Handler
builder.defineCatalogHandler(({ type, id, extra }) => {
    console.log("Catalog Handler Called ->", { type, id, extra });

    if (type === "movie" && id === "criterion") {
        // If no 'sort' param, use 'year_desc' as the default
        const sortOption = extra && extra.sort ? extra.sort : "year_desc";
        console.log("Sorting by:", sortOption);

        const sortedCatalog = getSortedCatalog(sortOption);
        // Important: 'extraSupported' so Stremio knows we have a 'sort' menu
        return Promise.resolve({
            metas: sortedCatalog,
            extraSupported: ["sort"]
        });
    }
    return Promise.reject("Not supported type or id");
});

// 6) Meta Handler (Single Movie)
builder.defineMetaHandler(({ id }) => {
    console.log("Meta Handler Called -> ID:", id);
    const movie = movies.find(m => m.id === id);

    if (movie) {
        return Promise.resolve({
            meta: {
                id: movie.id,
                name: movie.title,
                poster: movie.poster,
                type: "movie",
                description: movie.overview || "A film from the Criterion Collection.",
                runtime: movie.runtime || "N/A",
                releaseInfo: movie.year || "Unknown",
                background: movie.poster,
                logo: movie.id
                    ? `https://images.metahub.space/logo/medium/${movie.id}/img`
                    : undefined,
                imdbRating: movie.imdb_rating !== "N/A"
                    ? parseFloat(movie.imdb_rating).toFixed(1)
                    : undefined,
                genres: movie.genre !== "Unknown"
                    ? movie.genre.split(", ")
                    : [],
                trailer: movie.trailer || undefined
            }
        });
    }

    return Promise.reject("Not found");
});

// 7) Serve via HTTP
const addonInterface = builder.getInterface();
const { serveHTTP } = require("stremio-addon-sdk");

serveHTTP(addonInterface, { port: 7000 });

console.log("✅ Stremio Addon running on http://localhost:7000/manifest.json");
