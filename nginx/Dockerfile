# Use official Nginx image with Alpine Linux
FROM nginx:alpine

# Remove the default Nginx configuration
# This prevents conflicts with our custom configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom Nginx configuration
# This file defines how Nginx routes requests
COPY nginx.conf /etc/nginx/conf.d/

# Expose port 80 for HTTP traffic
EXPOSE 80

# Start Nginx in foreground mode
# "daemon off" is required for Docker to keep the container running
# Without this, Nginx would run in background and container would exit
CMD ["nginx", "-g", "daemon off;"]
