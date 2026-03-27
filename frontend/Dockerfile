# Use official Nginx image with Alpine Linux (lightweight)
# Alpine reduces the image size significantly
FROM nginx:alpine

# Copy all frontend files to Nginx's default document root
# Nginx serves files from /usr/share/nginx/html/ by default
COPY . /usr/share/nginx/html/

# Expose port 80 for HTTP traffic
# This is the default port for web servers
EXPOSE 80

# Nginx starts automatically with the base image's CMD
# No need to specify CMD as nginx:alpine handles it
