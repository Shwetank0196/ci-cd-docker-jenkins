# Dockerfile Guide

A Dockerfile is like a recipe that tells Docker how to build your image. This guide explains every Dockerfile instruction with examples from our project.

## What is a Dockerfile?

A Dockerfile is a text file that contains step-by-step instructions for creating a Docker image. Each instruction creates a "layer" in the image.

**Think of it as:**
- A recipe for cooking (each step builds on the previous)
- Assembly instructions for furniture
- A script that runs automatically

## Basic Structure

Every Dockerfile follows this general pattern:

```dockerfile
# 1. Choose a base image
FROM base-image

# 2. Set up the working directory
WORKDIR /app

# 3. Copy files
COPY source destination

# 4. Install dependencies
RUN command

# 5. Expose ports (documentation only)
EXPOSE port

# 6. Define startup command
CMD ["command", "args"]
```

## Dockerfile Instructions Explained

### FROM

**Specifies the base image to build from.**

```dockerfile
FROM node:18-alpine
```

**What it does:**
- Every Dockerfile must start with `FROM`
- Specifies which image to use as the starting point
- Like choosing a foundation for a house

**Common base images:**
- `node:18-alpine` - Node.js 18 on Alpine Linux (small)
- `python:3.11-slim` - Python 3.11 (lightweight)
- `nginx:alpine` - Nginx web server (small)
- `ubuntu:22.04` - Full Ubuntu OS

**Why `alpine`?**
- Alpine Linux is extremely small (~5MB)
- Results in smaller final images
- Faster downloads and deploys
- Uses less disk space

**Example:**
```dockerfile
FROM node:18-alpine
# Now we have Node.js 18 available in our image
```

---

### WORKDIR

**Sets the working directory inside the container.**

```dockerfile
WORKDIR /app
```

**What it does:**
- Creates the directory if it doesn't exist
- All subsequent commands run from this directory
- Like using `cd /app` but permanent

**Why use it:**
- Keeps your files organized
- Makes paths predictable
- Standard practice: use `/app` for application code

**Example:**
```dockerfile
WORKDIR /app
COPY package.json ./
# package.json is now at /app/package.json
```

---

### COPY

**Copies files from your computer to the image.**

```dockerfile
COPY source destination
```

**What it does:**
- Copies files/folders from your project to the container image
- `source` is on your computer (relative to Dockerfile location)
- `destination` is inside the container

**Examples:**

```dockerfile
# Copy single file
COPY package.json /app/

# Copy all files from current directory
COPY . /app

# Copy specific files
COPY *.json /app/

# Using WORKDIR (recommended)
WORKDIR /app
COPY package.json ./
COPY . .
```

**Best Practice - Copy in the right order:**

```dockerfile
# ❌ Bad: Copy everything at once
COPY . .
RUN npm install

# ✅ Good: Copy package files first
COPY package*.json ./
RUN npm install
COPY . .
```

**Why?** Docker caches each layer. If you only change your code (not dependencies), Docker can reuse the `npm install` layer instead of reinstalling everything.

---

### ADD

**Similar to COPY but with extra features.**

```dockerfile
ADD source destination
```

**What's different from COPY:**
- Can download files from URLs
- Can automatically extract tar files

**Best practice:** Use `COPY` unless you specifically need `ADD` features. `COPY` is more explicit and predictable.

---

### RUN

**Executes commands during the image build.**

```dockerfile
RUN command
```

**What it does:**
- Runs commands when building the image
- Used to install software, create directories, etc.
- Each `RUN` creates a new layer

**Examples:**

```dockerfile
# Install Node.js packages
RUN npm install

# Create directory
RUN mkdir -p /app/data

# Install system packages (on Debian/Ubuntu)
RUN apt-get update && apt-get install -y curl

# Multiple commands (use && to chain)
RUN npm install && \
    npm cache clean --force
```

**Best Practice - Combine commands:**

```dockerfile
# ❌ Bad: Multiple RUN commands = more layers
RUN apt-get update
RUN apt-get install -y curl
RUN apt-get clean

# ✅ Good: Single RUN command = one layer
RUN apt-get update && \
    apt-get install -y curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
```

---

### CMD

**Specifies the default command to run when container starts.**

```dockerfile
CMD ["executable", "param1", "param2"]
```

**What it does:**
- Defines what runs when you do `docker run <image>`
- Only the last `CMD` in a Dockerfile is used
- Can be overridden when running the container

**Format options:**

```dockerfile
# Exec form (preferred, no shell processing)
CMD ["node", "server.js"]

# Shell form (runs in a shell)
CMD node server.js

# As parameters to ENTRYPOINT
CMD ["--port", "3000"]
```

**Examples:**

```dockerfile
# Start Node.js server
CMD ["node", "server.js"]

# Start with NPM
CMD ["npm", "start"]

# Run shell
CMD ["sh"]
```

**When to use:** For the main process that should run in the container.

---

### ENTRYPOINT

**Configures the container to run as an executable.**

```dockerfile
ENTRYPOINT ["executable", "param1"]
```

**What it does:**
- Similar to `CMD` but harder to override
- Best used when container should always run a specific command
- Often combined with `CMD` for flexibility

**Difference between CMD and ENTRYPOINT:**

```dockerfile
# With CMD
CMD ["node", "server.js"]
# Override: docker run myapp npm test

# With ENTRYPOINT
ENTRYPOINT ["node", "server.js"]
# Can't easily override: docker run myapp npm test won't work

# Best: Combine both
ENTRYPOINT ["node"]
CMD ["server.js"]
# docker run myapp test.js  => runs "node test.js"
```

**When to use:** When your container should always run a specific executable.

---

### EXPOSE

**Documents which ports the container listens on.**

```dockerfile
EXPOSE 3000
```

**What it does:**
- **Documentation only** - tells users which ports are used
- Does NOT actually publish the port
- You still need `-p` flag when running container

**Examples:**

```dockerfile
# Single port
EXPOSE 3000

# Multiple ports
EXPOSE 3000 4000

# Port with protocol
EXPOSE 80/tcp
EXPOSE 53/udp
```

**Important:** This is documentation! To actually access the port, use:
```bash
docker run -p 3000:3000 myapp
```

---

### ENV

**Sets environment variables.**

```dockerfile
ENV KEY=VALUE
```

**What it does:**
- Sets environment variables available during build and runtime
- Can be overridden with `-e` flag when running container

**Examples:**

```dockerfile
# Single variable
ENV NODE_ENV=production

# Multiple variables
ENV NODE_ENV=production \
    PORT=3000 \
    LOG_LEVEL=info

# Using in Dockerfile
ENV APP_HOME=/app
WORKDIR $APP_HOME
```

**When to use:** For configuration that's the same for all environments.

---

### ARG

**Defines build-time variables.**

```dockerfile
ARG VARIABLE_NAME=default_value
```

**What it does:**
- Variables only available during build (not at runtime)
- Can be passed during build: `docker build --build-arg VARIABLE_NAME=value .`

**Examples:**

```dockerfile
# Define ARG
ARG NODE_VERSION=18

# Use ARG
FROM node:${NODE_VERSION}-alpine

# With default value
ARG PORT=3000
EXPOSE $PORT
```

**Difference from ENV:**
- `ARG`: Available during build only
- `ENV`: Available during build AND runtime

---

### VOLUME

**Creates a mount point for external volumes.**

```dockerfile
VOLUME /app/data
```

**What it does:**
- Marks a directory as a mount point
- Data in this directory can persist outside the container

**When to use:** For directories that contain data you want to persist (databases, logs, uploads).

---

## Layer Caching: Why Order Matters

Docker caches each layer. If a layer hasn't changed, Docker reuses the cached version.

**Example: Why we copy package.json first**

```dockerfile
# ❌ Inefficient:
COPY . .                    # Layer 1: All files
RUN npm install             # Layer 2: Install deps

# If you change a single line of code:
# - Layer 1 changes (all files copied again)
# - Layer 2 must rebuild (npm install runs again) 😢
```

```dockerfile
# ✅ Efficient:
COPY package*.json ./       # Layer 1: Just package files
RUN npm install             # Layer 2: Install deps
COPY . .                    # Layer 3: Application code

# If you change code but not package.json:
# - Layer 1: Cached ✓
# - Layer 2: Cached ✓ (npm install skipped!)
# - Layer 3: Rebuilds (only code copied) 😊
```

**Result:** Builds are much faster because deps don't reinstall every time!

---

## .dockerignore

Just like `.gitignore` but for Docker.

**File:** `.dockerignore`

**What it does:**
- Excludes files from being sent to Docker during build
- Makes builds faster
- Reduces image size
- Protects sensitive files

**Example: backend/.dockerignore**

```
# Dependencies (will be installed during build)
node_modules

# Logs
npm-debug.log
*.log

# Database files (use volumes instead)
data/
*.db

# Git files
.git
.gitignore

# Environment files (might contain secrets)
.env
.env.local

# Documentation
README.md
*.md

# Test files
test/
*.test.js

# IDE files
.vscode/
.idea/
```

**Why ignore node_modules?**
- Already huge (~100MB+)
- Will be reinstalled during build anyway
- Makes build context much smaller
- Faster uploads to Docker daemon

---

## Our Project Dockerfiles Explained

### Backend Dockerfile (backend/Dockerfile)

```dockerfile
# Use Node.js 18 with Alpine Linux (lightweight)
FROM node:18-alpine

# Set working directory to /app
WORKDIR /app

# Copy only package files first (for caching)
COPY package*.json ./

# Install dependencies (this layer is cached if package.json unchanged)
RUN npm install

# Now copy the rest of the application code
COPY . .

# Create data directory (legacy - no longer needed with MySQL container)
RUN mkdir -p /app/data

# Document that this app uses port 3000
EXPOSE 3000

# Start the Node.js server when container runs
CMD ["node", "server.js"]
```

**Why this order?**
1. Base image first (rarely changes)
2. Package files (change less often)
3. Install deps (cached if package.json unchanged)
4. Copy code (changes most often)
5. Setup and run

---

### Frontend Dockerfile (frontend/Dockerfile)

```dockerfile
# Use Nginx with Alpine Linux
FROM nginx:alpine

# Copy all frontend files to Nginx's default directory
COPY . /usr/share/nginx/html/

# Document that Nginx listens on port 80
EXPOSE 80

# CMD is inherited from nginx:alpine base image
# It automatically starts Nginx with: nginx -g "daemon off;"
```

**Why it's simpler:**
- No dependencies to install
- Just copying static files
- Nginx base image already configured

---

### Nginx Reverse Proxy Dockerfile (nginx/Dockerfile)

```dockerfile
# Use official Nginx with Alpine
FROM nginx:alpine

# Remove default Nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom configuration
COPY nginx.conf /etc/nginx/conf.d/

# Expose port 80
EXPOSE 80

# Start Nginx in foreground mode (required for Docker)
CMD ["nginx", "-g", "daemon off;"]
```

**Why `daemon off`?**
- Normally Nginx runs in background (daemon mode)
- Docker needs a foreground process to keep container alive
- `daemon off` keeps Nginx in foreground

---

## Best Practices

### 1. Use Specific Base Image Tags

```dockerfile
# ❌ Bad: Tag changes over time
FROM node

# ✅ Good: Specific version
FROM node:18-alpine

# ✅ Even better: Specific version with digest
FROM node:18-alpine@sha256:abc123...
```

### 2. Minimize Layers

```dockerfile
# ❌ Bad: Too many layers
RUN apt-get update
RUN apt-get install -y curl
RUN apt-get install -y git
RUN apt-get clean

# ✅ Good: Combined into one layer
RUN apt-get update && \
    apt-get install -y curl git && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
```

### 3. Leverage Build Cache

```dockerfile
# Copy dependency files first
COPY package*.json ./
RUN npm install

# Copy code last (changes more often)
COPY . .
```

### 4. Use .dockerignore

Always create `.dockerignore` to exclude unnecessary files.

### 5. Don't Run as Root (Advanced)

```dockerfile
# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Switch to that user
USER nodejs
```

### 6. Use Multi-Stage Builds (Advanced)

For smaller production images:

```dockerfile
# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm install --production
CMD ["node", "dist/server.js"]
```

---

## Common Dockerfile Patterns

### Node.js Application

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

### Python Application

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["python", "app.py"]
```

### Static Website (Nginx)

```dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html/
EXPOSE 80
```

---

## Testing Your Dockerfile

```bash
# Build the image
docker build -t myapp .

# Check the image was created
docker images myapp

# Run a container from it
docker run -d -p 3000:3000 --name test myapp

# Check if it's running
docker ps

# View logs
docker logs test

# Test the application
curl http://localhost:3000

# Clean up
docker stop test
docker rm test
```

---

## Troubleshooting

### Image is too large?
- Use Alpine base images
- Clean up in the same `RUN` command
- Use `.dockerignore`
- Consider multi-stage builds

### Build is slow?
- Check layer caching (copy dependencies first)
- Use `.dockerignore` to exclude large folders
- Combine `RUN` commands

### "No such file or directory"?
- Check `WORKDIR` is set
- Check file paths in `COPY` commands
- Check `.dockerignore` isn't excluding needed files

---

## Next Steps

- [04-docker-compose-guide.md](./04-docker-compose-guide.md) - Manage multiple containers
- [02-docker-commands.md](./02-docker-commands.md) - Command reference
- [07-troubleshooting.md](./07-troubleshooting.md) - Common issues
