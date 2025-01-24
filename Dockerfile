# Use the official Node image
FROM node:20

# Create a working directory
WORKDIR /usr/src/app

# Copy everything
COPY . ./app/

# Install dependencies
RUN npm ci

# Expose the port the add-on listens on, e.g. 7000
EXPOSE 7000

WORKDIR /usr/src/app/app

# Run your Node script
CMD ["node", "stremio_addon.js"]