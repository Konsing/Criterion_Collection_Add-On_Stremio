const { addonBuilder, getRouter } = require("stremio-addon-sdk");
const fs = require("fs");
const path = require("path");

// 1. Load movies from the JSON file.
//    Adjust the path if your `criterion_movies.json` is elsewhere.
const filePath = path.join(__dirname, "..", "criterion_movies.json");
let movies = [];
try {
  movies = JSON.parse(fs.readFileSync(filePath, "utf-8"));
} catch (err) {
  console.error("Error reading criterion_movies.json:", err);
}

// 2. Define the Stremio manifest
const manifest = {
  id: "stremio-criterion",
  version: "1.0.0",
  name: "Criterion Collection",
  description: "Lists Criterion Collection movies with metadata and posters.",
  resources: ["catalog", "meta"],
  types: ["movie"],
  idPrefixes: ["tt"],
  catalogs: [
    {
      type: "movie",
      id: "criterion",
      name: "Criterion Collection"
    }
  ]
};

// 3. Prepare the catalog array
const catalog = movies.map(movie => ({
  id: movie.id,                  // e.g. "tt28607951"
  name: movie.title,             // e.g. "Anora"
  poster: movie.poster,          // e.g. "https://s3.amazonaws..."
  type: "movie",
  description: movie.description || "A film from the Criterion Collection."
}));

// 4. Create an addon builder
const builder = new addonBuilder(manifest);

// 5. Define the Catalog Handler
builder.defineCatalogHandler(({ type, id }) => {
  if (type === "movie" && id === "criterion") {
    return Promise.resolve({ metas: catalog });
  }
  return Promise.resolve({ metas: [] });
});

// 6. Define the Meta Handler
builder.defineMetaHandler(({ id }) => {
  const movie = movies.find(m => m.id === id);
  if (movie) {
    return Promise.resolve({
      meta: {
        id: movie.id,
        name: movie.title,
        poster: movie.poster,
        type: "movie",
        description: movie.description || "A film from the Criterion Collection."
      }
    });
  }
  return Promise.reject("Not found");
});

// 7. Export as a Serverless Function for Vercel
const addonInterface = builder.getInterface();
const router = getRouter(addonInterface);

module.exports = (req, res) => {
  return router(req, res);
};
