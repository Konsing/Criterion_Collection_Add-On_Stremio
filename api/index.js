const { addonBuilder, getRouter } = require("stremio-addon-sdk");
const fs = require("fs");
const path = require("path");

let movies = [];
try {
  // Adjust path if needed
  const filePath = path.join(__dirname, "criterion_movies.json");
  movies = JSON.parse(fs.readFileSync(filePath, "utf-8"));
} catch (err) {
  console.error("Error reading criterion_movies.json:", err);
}

// Define manifest
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

// Prepare the catalog
const catalog = movies.map(movie => ({
  id: movie.id,
  name: movie.title,
  poster: movie.poster,
  type: "movie",
  description: movie.description || "A film from the Criterion Collection."
}));

// Build add-on
const builder = new addonBuilder(manifest);

// Catalog Handler
builder.defineCatalogHandler(({ type, id }) => {
  if (type === "movie" && id === "criterion") {
    return Promise.resolve({ metas: catalog });
  }
  return Promise.resolve({ metas: [] });
});

// Meta Handler
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

// Convert builder to router
const addonInterface = builder.getInterface();
const router = getRouter(addonInterface);

// EXPORT with a callback
module.exports = (req, res) => {
  router(req, res, (err) => {
    if (err) {
      res.statusCode = 500;
      res.end("Error: " + err);
    } else {
      res.statusCode = 404;
      res.end("Not found");
    }
  });
};
