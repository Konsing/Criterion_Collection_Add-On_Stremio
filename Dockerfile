# Use an official Node.js runtime as the base image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Set the working directory to the app folder
WORKDIR /app/app

# Expose the port your app runs on (adjust if needed)
EXPOSE 7000

# Command to run your application
CMD ["node", "stremio_addon.js"]