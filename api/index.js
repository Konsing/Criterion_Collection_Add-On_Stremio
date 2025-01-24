// File: api/index.js
const { addonBuilder, requestHandler } = require("stremio-addon-sdk");
const fs = require("fs");
const path = require("path");

// Load criterion_movies.json
let movies = [];
try {
  // If the file is in api/, use path.join(__dirname, "criterion_movies.json")
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

// Prepare catalog array
const catalog = movies.map(movie => ({
  id: movie.id,
  name: movie.title,
  poster: movie.poster,
  type: "movie",
  description: movie.description || "A film from the Criterion Collection."
}));

// Create the add-on builder
const builder = new addonBuilder(manifest);

// Define Catalog Handler
builder.defineCatalogHandler(({ type, id }) => {
  if (type === "movie" && id === "criterion") {
    return Promise.resolve({ metas: catalog });
  }
  return Promise.resolve({ metas: [] });
});

// Define Meta Handler
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

// Convert the built add-on to a request handler
const addonInterface = builder.getInterface();
const handleRequest = requestHandler(addonInterface);

// Export your serverless function
module.exports = (req, res) => {
  // This automatically handles 404s & errors
  handleRequest(req, res);
};
