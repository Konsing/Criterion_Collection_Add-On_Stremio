// const { addonBuilder } = require("stremio-addon-sdk");
// const fs = require("fs");

// // Load movies from JSON
// let movies = [];
// try {
//     movies = JSON.parse(fs.readFileSync("criterion_movies.json", "utf-8"));
// } catch (err) {
//     console.error("Error reading criterion_movies.json:", err);
// }

// // Define the Stremio manifest
// const manifest = {
//     "id": "stremio-criterion",
//     "version": "1.0.0",
//     "name": "Criterion Collection",
//     "description": "Lists Criterion Collection movies with metadata and posters.",
//     "resources": ["catalog", "meta"],
//     "types": ["movie"],
//     "idPrefixes": ["tt"],  // Ensure this matches IMDb ID prefix
//     "catalogs": [
//         {
//             "type": "movie",
//             "id": "criterion",
//             "name": "Criterion Collection"
//         }
//     ]
// };

// // Format the catalog properly for Stremio  
// const catalog = movies.map(movie => ({
//     "id": movie.id,
//     "name": movie.title,
//     "poster": movie.poster,
//     "type": "movie",
//     "description": movie.description || "A film from the Criterion Collection."
// }));

// // Build the Stremio Add-on
// const builder = new addonBuilder(manifest);

// // Define the catalog handler
// builder.defineCatalogHandler(({ type, id }) => {
//     if (type === "movie" && id === "criterion") {
//         return Promise.resolve({ metas: catalog });
//     }
//     return Promise.reject("Not supported type");
// });

// // Define the meta handler
// builder.defineMetaHandler(({ id }) => {
//     const movie = movies.find(m => m.id === id || id === m.title.toLowerCase().replace(/\s+/g, "-"));
    
//     if (movie) {
//         return Promise.resolve({
//             "meta": {
//                 "id": movie.id,
//                 "name": movie.title,
//                 "poster": movie.poster,
//                 "type": "movie",
//                 "description": movie.description || "A film from the Criterion Collection."
//             }
//         });
//     }
//     return Promise.reject("Not found");
// });

// // Serve the add-on
// const addonInterface = builder.getInterface();
// const { serveHTTP } = require("stremio-addon-sdk");

// serveHTTP(addonInterface, { port: 7000 });

// console.log(" Stremio Add-on running at: http://localhost:7000/manifest.json");
