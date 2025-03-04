const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");
const fs = require("fs");

// 1) Load movies synchronously once at startup (consider async readFile if the file is large)
let movies = [];
try {
  const data = fs.readFileSync("criterion_movies.json", "utf-8");
  movies = JSON.parse(data);
  console.log("Loaded movies from criterion_movies.json");
} catch (err) {
  console.error("Error reading criterion_movies.json:", err);
}

// 2) Manifest with updated sort options
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
      extra: [
        {
          name: "sort",
          options: [
            "Year Ascending",
            "Year Descending",
            "Runtime Ascending",
            "Runtime Descending",
            "Rating Ascending",
            "Rating Descending"
          ],
          isRequired: false
        }
      ]
    }
  ]
};

// 3) Sorting function with added rating sort options
function getSortedCatalog(sortOption) {
  const sortedMovies = [...movies];
  switch (sortOption) {
    case "Year Ascending":
      sortedMovies.sort((a, b) => (parseInt(a.year) || 0) - (parseInt(b.year) || 0));
      break;
    case "Year Descending":
      sortedMovies.sort((a, b) => (parseInt(b.year) || 0) - (parseInt(a.year) || 0));
      break;
    case "Runtime Ascending":
      sortedMovies.sort((a, b) => {
        // Extract numeric runtime value
        const runtimeA = parseInt(a.runtime) || 0;
        const runtimeB = parseInt(b.runtime) || 0;
        return runtimeA - runtimeB;
      });
      break;
    case "Runtime Descending":
      sortedMovies.sort((a, b) => {
        const runtimeA = parseInt(a.runtime) || 0;
        const runtimeB = parseInt(b.runtime) || 0;
        return runtimeB - runtimeA;
      });
      break;
    case "Rating Ascending":
      sortedMovies.sort((a, b) => (parseFloat(a.imdb_rating) || 0) - (parseFloat(b.imdb_rating) || 0));
      break;
    case "Rating Descending":
      sortedMovies.sort((a, b) => (parseFloat(b.imdb_rating) || 0) - (parseFloat(a.imdb_rating) || 0));
      break;
    default:
      // Default to Year Descending if no valid option is provided
      sortedMovies.sort((a, b) => (parseInt(b.year) || 0) - (parseInt(a.year) || 0));
      break;
  }
  // Build catalog with IMDb rating added as a link
  const catalog = sortedMovies.map(movie => {
    const links = [];
    // Add Cast links
    if (movie.cast && movie.cast.length > 0) {
      links.push(...movie.cast.map(actor => ({
        name: actor,
        category: "Cast",
        url: `stremio:///search?search=${encodeURIComponent(actor)}`
      })));
    }
    // Add Director links
    if (movie.director) {
      links.push({
        name: movie.director,
        category: "Directors",
        url: `stremio:///search?search=${encodeURIComponent(movie.director)}`
      });
    }
    // Add Genre links
    if (movie.genre) {
      movie.genre.split(", ").forEach(genre => {
        links.push({
          name: genre,
          category: "Genres",
          url: `stremio:///search?search=${encodeURIComponent(genre)}`
        });
      });
    }
    // Add IMDb rating link using a custom category to avoid default labels
    if (movie.imdb_rating) {
      links.push({
        name: `⭐ IMDB: ${movie.imdb_rating}`,
        category: "imdb_rating", // Using a custom category to prevent fallback to "LINKS_IMDB"
        url: `stremio:///search?search=${encodeURIComponent(movie.imdb_rating)}`
      });
    }
    return {
      id: movie.id,
      name: movie.title,
      poster: movie.poster,
      type: "movie",
      description: movie.overview || "A film from the Criterion Collection.",
      releaseInfo: movie.year || "Unknown",
      runtime: movie.runtime !== "Unknown" ? movie.runtime : "N/A",
      background: movie.poster,
      logo: movie.id ? `https://images.metahub.space/logo/medium/${movie.id}/img` : undefined,
      links: links,
      genres: movie.genre && movie.genre !== "Unknown" ? movie.genre.split(", ") : []
    };
  });
  return catalog;
}

// 4) Build the addon
const builder = new addonBuilder(manifest);

// 5) Catalog Handler
builder.defineCatalogHandler(({ type, id, extra }) => {
  if (type === "movie" && id === "criterion") {
    const sortOption = extra && extra.sort ? extra.sort : "Year Descending";
    const sortedCatalog = getSortedCatalog(sortOption);
    return Promise.resolve({
      metas: sortedCatalog,
      extraSupported: ["sort"]
    });
  }
  return Promise.reject("Not supported type or id");
});

// 6) Meta Handler for individual movie details (with IMDb rating as a link)
builder.defineMetaHandler(({ id }) => {
  const movie = movies.find(m => m.id === id);
  if (movie) {
    // Build a links array for the meta view that includes the IMDb rating link
    const metaLinks = [];
    if (movie.imdb_rating) {
      metaLinks.push({
        name: `⭐ IMDB: ${movie.imdb_rating}`,
        category: "imdb_rating", // Custom category to avoid default "LINKS_IMDB"
        url: `stremio:///search?search=${encodeURIComponent(movie.imdb_rating)}`
      });
    }
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
        logo: movie.id ? `https://images.metahub.space/logo/medium/${movie.id}/img` : undefined,
        genres: movie.genre && movie.genre !== "Unknown" ? movie.genre.split(", ") : [],
        director: movie.director ? [movie.director] : [],
        cast: movie.cast || [],
        trailer: movie.trailer || undefined,
        links: metaLinks
      }
    });
  }
  return Promise.reject("Not found");
});

// 7) Serve the addon via HTTP
const addonInterface = builder.getInterface();
serveHTTP(addonInterface, { port: 7000 });
console.log("Stremio Addon running on http://localhost:7000/manifest.json");
