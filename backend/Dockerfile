# Use official Node.js 18 LTS (Long Term Support) image
# Alpine is a lightweight Linux distribution, making the image smaller
FROM node:18

# Install build dependencies needed for native modules (like mysql2)
# python3, make, and g++ are required for node-gyp to compile native addons
RUN apt-get update && apt-get install -y python3 make g++

# Set the working directory inside the container
# All subsequent commands will run from this directory
WORKDIR /app

# Copy package.json and package-lock.json first
# This is done separately to take advantage of Docker layer caching
# If dependencies haven't changed, Docker will use cached layers
COPY package*.json ./

# Install Node.js dependencies
# These will be cached unless package.json changes
RUN npm install

# Copy the rest of the application code
# This is done after npm install so code changes don't invalidate the npm install cache
COPY . .

# Expose port 3000
# This documents which port the application uses
# Note: This doesn't actually publish the port; use -p flag when running
EXPOSE 3000

# Command to run when container starts
# This starts the Node.js server
CMD ["node", "server.js"]