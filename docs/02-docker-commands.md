# Docker Commands Reference

This guide explains all commonly used Docker commands with detailed explanations of what they do and why you would use them.

## Table of Contents

1. [Image Commands](#image-commands)
2. [Container Commands](#container-commands)
3. [Docker Compose Commands](#docker-compose-commands)
4. [Network Commands](#network-commands)
5. [Volume Commands](#volume-commands)
6. [System Commands](#system-commands)
7. [Command Flags Explained](#command-flags-explained)

---

## Image Commands

Images are the blueprints for your containers. These commands help you build, manage, and inspect images.

### `docker build`

**Builds a Docker image from a Dockerfile.**

```bash
docker build -t <image-name> .
```

**What it does:** Creates a Docker image by following instructions in the Dockerfile.

**Common flags:**

- `-t` or `--tag`: Give the image a name and optionally a tag
  - Example: `-t myapp:latest` or `-t myapp:v1.0`
  - Format: `name:tag` (tag is optional, defaults to "latest")

- `.`: The build context (current directory)
  - This is where Docker looks for the Dockerfile and files to copy
  - You can specify a different path: `docker build -t myapp ./backend`

- `--no-cache`: Build without using cached layers
  - Forces Docker to rebuild everything from scratch
  - Useful when you want to ensure fresh installations
  ```bash
  docker build -t myapp --no-cache .
  ```

- `-f` or `--file`: Specify a different Dockerfile name
  ```bash
  docker build -t myapp -f Dockerfile.dev .
  ```

**Examples:**

```bash
# Build backend image
cd backend
docker build -t student-api .

# Build with a specific tag
docker build -t student-api:v1.0 .

# Build from parent directory
docker build -t student-api -f backend/Dockerfile ./backend
```

**When to use:** When you create or modify a Dockerfile and need to create an image.

---

### `docker images`

**Lists all Docker images on your system.**

```bash
docker images
```

**What it does:** Shows all images you've built or downloaded, with details like:
- Repository name
- Tag
- Image ID
- Creation date
- Size

**Common flags:**

- `-a` or `--all`: Show all images including intermediate layers
  ```bash
  docker images -a
  ```

- `-q` or `--quiet`: Only show image IDs (useful for scripting)
  ```bash
  docker images -q
  ```

**Example output:**
```
REPOSITORY       TAG       IMAGE ID       CREATED          SIZE
student-api      latest    abc123def456   10 minutes ago   200MB
nginx            alpine    def789ghi012   2 days ago       23MB
```

**When to use:** To see what images you have, check image sizes, or find image IDs for other commands.

---

### `docker rmi`

**Removes one or more Docker images.**

```bash
docker rmi <image-name-or-id>
```

**What it does:** Deletes an image from your system to free up space.

**Common flags:**

- `-f` or `--force`: Force removal even if containers are using this image
  ```bash
  docker rmi -f student-api
  ```

**Examples:**

```bash
# Remove by name
docker rmi student-api

# Remove by ID
docker rmi abc123def456

# Remove multiple images
docker rmi student-api nginx:alpine

# Remove all unused images
docker image prune
```

**When to use:** To clean up old or unused images and free up disk space.

**Note:** You must stop and remove containers using an image before you can remove the image.

---

### `docker pull`

**Downloads an image from Docker Hub or another registry.**

```bash
docker pull <image-name>
```

**What it does:** Downloads a pre-built image from a registry (like downloading an app from an app store).

**Examples:**

```bash
# Pull latest nginx
docker pull nginx

# Pull specific version
docker pull nginx:alpine

# Pull from a specific registry
docker pull myregistry.com/myapp:v1.0
```

**When to use:** When you need a base image (like node:18-alpine) or want to use someone else's pre-built image.

---

### `docker push`

**Uploads an image to Docker Hub or another registry.**

```bash
docker push <image-name>
```

**What it does:** Shares your image with others by uploading it to a registry.

**When to use:** When you want to share your image or deploy it to a server.

---

## Container Commands

Containers are running instances of images. These commands help you create, manage, and debug containers.

### `docker run`

**Creates and starts a new container from an image.**

```bash
docker run [FLAGS] <image-name>
```

**What it does:** This is the most important command! It creates a brand new container from an image and starts it.

**Common flags:**

#### `-d` or `--detach`
**Runs container in the background (detached mode).**

```bash
docker run -d nginx
```

- Without `-d`: Your terminal stays attached; you see logs in real-time
- With `-d`: Container runs in background; your terminal is free
- **When to use:** Almost always use this for servers and long-running processes

---

#### `-p` or `--publish`
**Maps ports from container to your computer.**

```bash
docker run -p <host-port>:<container-port> <image>
```

**Format:** `-p HOST_PORT:CONTAINER_PORT`

- **Left side (HOST_PORT):** Port on your computer
- **Right side (CONTAINER_PORT):** Port inside the container

**Examples:**

```bash
# Map port 3000 on your computer to port 3000 in container
docker run -p 3000:3000 student-api

# Map port 8080 on your computer to port 80 in container
docker run -p 8080:80 nginx

# Multiple port mappings
docker run -p 3000:3000 -p 4000:4000 myapp
```

**Why this matters:** Containers are isolated. Without `-p`, you can't access the app from your browser.

**When to use:** Whenever you need to access a service running in a container.

---

#### `--name`
**Gives your container a custom name.**

```bash
docker run --name <container-name> <image>
```

**Examples:**

```bash
docker run --name my-api student-api
docker run --name web-server nginx
```

**Why use custom names:**
- Easier to remember than random names (like "quirky_einstein")
- Easier to reference in other commands
- Makes `docker ps` output more readable

**When to use:** Always give important containers meaningful names!

---

#### `-it`
**Creates an interactive terminal session.**

```bash
docker run -it <image> sh
```

**Two flags combined:**
- `-i` or `--interactive`: Keep STDIN open (so you can type)
- `-t` or `--tty`: Allocate a terminal (so it looks like a normal terminal)

**Examples:**

```bash
# Start an interactive shell inside a container
docker run -it node:18-alpine sh

# Run a command interactively
docker run -it ubuntu bash
```

**When to use:**
- To explore inside a container
- To run commands manually
- For debugging

**Tip:** Type `exit` to leave the interactive session.

---

#### `-v` or `--volume`
**Mounts a volume (connects a folder from your computer to the container).**

```bash
docker run -v <host-path>:<container-path> <image>
```

**Format:** `-v HOST_PATH:CONTAINER_PATH`

**Examples:**

```bash
# Mount current directory to /app in container
docker run -v $(pwd):/app student-api

# Mount data directory for MySQL persistence
docker run -v $(pwd)/data:/app/data student-api

# Named volume (Docker manages the location)
docker run -v mydata:/app/data student-api
```

**Why use volumes:**
- Data persists even after container is deleted
- Share files between your computer and container
- Share data between multiple containers

**When to use:** For databases, logs, or any data you want to keep.

---

#### `-e` or `--env`
**Sets environment variables.**

```bash
docker run -e KEY=VALUE <image>
```

**Examples:**

```bash
docker run -e NODE_ENV=production student-api
docker run -e PORT=3000 -e DB_HOST=localhost student-api
```

**When to use:** To configure your application without rebuilding the image.

---

#### `--rm`
**Automatically removes the container when it stops.**

```bash
docker run --rm <image>
```

**When to use:** For temporary containers or testing. Saves you from manually cleaning up.

---

#### `--network`
**Connects the container to a specific network.**

```bash
docker run --network <network-name> <image>
```

**When to use:** To allow containers to communicate with each other.

---

### Complete Examples

```bash
# Simple: Run in background
docker run -d nginx

# Typical web server: Background + port mapping + name
docker run -d -p 8080:80 --name web nginx

# Development setup: Interactive + port + volume + name
docker run -it -p 3000:3000 -v $(pwd):/app --name dev-api student-api

# Production-like: Background + port + volume + env + name + auto-remove
docker run -d -p 3000:3000 -v $(pwd)/data:/app/data -e NODE_ENV=production --name api --rm student-api
```

---

### `docker ps`

**Lists running containers.**

```bash
docker ps
```

**What it does:** Shows all currently running containers with details like:
- Container ID
- Image name
- Command running
- Status (how long it's been running)
- Ports
- Container name

**Common flags:**

- `-a` or `--all`: Show all containers (including stopped ones)
  ```bash
  docker ps -a
  ```

- `-q` or `--quiet`: Only show container IDs
  ```bash
  docker ps -q
  ```

**Example output:**
```
CONTAINER ID   IMAGE         COMMAND           STATUS         PORTS                   NAMES
abc123def456   student-api   "node server.js"  Up 10 minutes  0.0.0.0:3000->3000/tcp  my-api
```

**When to use:**
- To check if your containers are running
- To get container IDs or names for other commands
- To see port mappings

---

### `docker stop`

**Stops a running container gracefully.**

```bash
docker stop <container-name-or-id>
```

**What it does:** Sends a SIGTERM signal to the container, giving it time to shut down gracefully (save data, close connections, etc.).

**Examples:**

```bash
docker stop my-api
docker stop abc123def456
docker stop $(docker ps -q)  # Stop all running containers
```

**When to use:** To stop a container without losing data or causing corruption.

---

### `docker start`

**Starts a stopped container.**

```bash
docker start <container-name-or-id>
```

**What it does:** Restarts a container that was previously stopped (not a new container, the same one).

**Examples:**

```bash
docker start my-api
docker start abc123def456
```

**Difference from `docker run`:**
- `docker run`: Creates a NEW container
- `docker start`: Starts an EXISTING container

---

### `docker restart`

**Restarts a container.**

```bash
docker restart <container-name-or-id>
```

**What it does:** Stops and then starts the container (like rebooting).

**When to use:** When you need to apply changes or fix issues without creating a new container.

---

### `docker rm`

**Removes a stopped container.**

```bash
docker rm <container-name-or-id>
```

**What it does:** Deletes a container permanently. You can't start it again.

**Common flags:**

- `-f` or `--force`: Force remove even if the container is running
  ```bash
  docker rm -f my-api
  ```

**Examples:**

```bash
# Remove a stopped container
docker rm my-api

# Remove multiple containers
docker rm api1 api2 api3

# Remove all stopped containers
docker container prune
```

**When to use:** To clean up old containers and free up resources.

---

### `docker logs`

**Views logs from a container.**

```bash
docker logs <container-name-or-id>
```

**What it does:** Shows what the application inside the container has printed to the console.

**Common flags:**

- `-f` or `--follow`: Follow logs in real-time (like `tail -f`)
  ```bash
  docker logs -f my-api
  ```

- `--tail <number>`: Show only the last N lines
  ```bash
  docker logs --tail 50 my-api
  ```

- `-t` or `--timestamps`: Show timestamps
  ```bash
  docker logs -t my-api
  ```

**Examples:**

```bash
# View all logs
docker logs my-api

# Follow logs in real-time
docker logs -f my-api

# Last 100 lines with timestamps
docker logs --tail 100 -t my-api
```

**When to use:** For debugging, monitoring, or checking if everything is working correctly.

---

### `docker exec`

**Executes a command inside a running container.**

```bash
docker exec [FLAGS] <container> <command>
```

**What it does:** Runs a command inside an already-running container.

**Common usage:**

```bash
# Open an interactive shell
docker exec -it <container> sh

# Run a command and see output
docker exec <container> ls -la
```

**Examples:**

```bash
# Open shell in running container
docker exec -it my-api sh

# Check Node.js version inside container
docker exec my-api node --version

# View files inside container
docker exec my-api ls -la /app

# Read a file inside container
docker exec my-api cat /app/package.json
```

**When to use:**
- To debug inside a running container
- To run one-off commands
- To check configuration or files

**Difference from `docker run`:**
- `docker run`: Creates a NEW container
- `docker exec`: Runs command in EXISTING container

---

### `docker inspect`

**Shows detailed information about a container or image.**

```bash
docker inspect <container-or-image>
```

**What it does:** Returns a JSON object with all configuration details.

**Useful information:**
- IP address
- Port mappings
- Volume mounts
- Environment variables
- Network settings

**When to use:** For advanced debugging or when you need detailed configuration info.

---

## Docker Compose Commands

Docker Compose manages multiple containers with a single command.

### `docker-compose up`

**Starts all services defined in docker-compose.yml.**

```bash
docker-compose up
```

**What it does:**
- Builds images if needed
- Creates networks
- Creates volumes
- Starts all containers

**Common flags:**

- `-d` or `--detach`: Run in background
  ```bash
  docker-compose up -d
  ```

- `--build`: Force rebuild images before starting
  ```bash
  docker-compose up --build
  ```

- `--scale`: Run multiple instances of a service
  ```bash
  docker-compose up --scale backend=3
  ```

**Examples:**

```bash
# Start all services in foreground
docker-compose up

# Start in background
docker-compose up -d

# Rebuild images and start
docker-compose up --build -d

# Start only specific services
docker-compose up backend frontend
```

**When to use:** This is your main command to start the entire application!

---

### `docker-compose down`

**Stops and removes all containers, networks.**

```bash
docker-compose down
```

**What it does:**
- Stops all running containers
- Removes containers
- Removes networks
- Keeps volumes by default

**Common flags:**

- `-v` or `--volumes`: Also remove volumes (deletes data!)
  ```bash
  docker-compose down -v
  ```

- `--rmi all`: Also remove images
  ```bash
  docker-compose down --rmi all
  ```

**When to use:** To completely stop your application and clean up.

---

### `docker-compose ps`

**Lists containers managed by Docker Compose.**

```bash
docker-compose ps
```

**What it does:** Shows status of all services defined in docker-compose.yml.

**When to use:** To check if all your services are running.

---

### `docker-compose logs`

**Views logs from all or specific services.**

```bash
docker-compose logs [service-name]
```

**Common flags:**

- `-f` or `--follow`: Follow logs in real-time
  ```bash
  docker-compose logs -f
  ```

- `--tail <number>`: Show last N lines
  ```bash
  docker-compose logs --tail 50 backend
  ```

**Examples:**

```bash
# All service logs
docker-compose logs

# Follow all logs
docker-compose logs -f

# Only backend logs
docker-compose logs backend

# Last 100 lines from frontend
docker-compose logs --tail 100 frontend
```

---

### `docker-compose exec`

**Runs a command in a running service container.**

```bash
docker-compose exec <service-name> <command>
```

**Examples:**

```bash
# Open shell in backend service
docker-compose exec backend sh

# Check npm version in backend
docker-compose exec backend npm --version

# List files in frontend
docker-compose exec frontend ls -la
```

---

### `docker-compose build`

**Builds or rebuilds service images.**

```bash
docker-compose build
```

**Common flags:**

- `--no-cache`: Build without cache
  ```bash
  docker-compose build --no-cache
  ```

**When to use:** After changing Dockerfiles or dependencies.

---

### `docker-compose restart`

**Restarts services.**

```bash
docker-compose restart [service-name]
```

**Examples:**

```bash
# Restart all services
docker-compose restart

# Restart only backend
docker-compose restart backend
```

---

## Command Flags Explained

### `-d` (Detached Mode)

**Runs container in the background.**

- **Without `-d`:** Terminal shows logs; you can't use the terminal for other commands
- **With `-d`:** Container runs in background; terminal is free

**Use `-d` for:** Servers, APIs, databases, long-running processes

---

### `-p` (Port Mapping)

**Format:** `-p HOST_PORT:CONTAINER_PORT`

**How to read it:** "Map my computer's port X to container's port Y"

**Examples:**
- `-p 3000:3000`: Access container's port 3000 via localhost:3000
- `-p 8080:80`: Access container's port 80 via localhost:8080

---

### `--name` (Custom Name)

**Gives a meaningful name to your container.**

- Easier to remember
- Easier to reference
- Better for `docker ps` output

---

### `-it` (Interactive Terminal)

**Two flags:**
- `-i`: Interactive (you can type)
- `-t`: Terminal (looks like a normal terminal)

**Use together** to get an interactive shell inside a container.

---

### `--build` (Force Rebuild)

**Forces Docker Compose to rebuild images even if they exist.**

**When to use:**
- After changing Dockerfile
- After updating dependencies
- When the image seems outdated

---

## Quick Reference Cheat Sheet

```bash
# Build image
docker build -t myapp .

# Run container
docker run -d -p 3000:3000 --name api myapp

# List running containers
docker ps

# List all containers
docker ps -a

# Stop container
docker stop api

# Start container
docker start api

# Remove container
docker rm api

# View logs
docker logs -f api

# Execute command in container
docker exec -it api sh

# Remove image
docker rmi myapp

# Docker Compose
docker-compose up -d          # Start all services
docker-compose down           # Stop all services
docker-compose ps             # List services
docker-compose logs -f        # Follow logs
docker-compose exec backend sh  # Shell into service
```

---

## Next Steps

- [03-dockerfile-guide.md](./03-dockerfile-guide.md) - Learn to write Dockerfiles
- [04-docker-compose-guide.md](./04-docker-compose-guide.md) - Master multi-container apps
- [07-troubleshooting.md](./07-troubleshooting.md) - Fix common issues
