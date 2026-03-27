# Docker Compose Guide

Docker Compose is a tool for running multi-container applications. Instead of running multiple `docker run` commands, you define everything in a `docker-compose.yml` file and start it all with one command!

## What is Docker Compose?

**Think of Docker Compose as an orchestra conductor:**
- You have multiple musicians (containers)
- Each plays a different instrument (service)
- The conductor (Docker Compose) makes them work together in harmony

**Without Docker Compose:**
```bash
# Run backend
docker run -d --name backend -p 3000:3000 --network mynet backend-image

# Run frontend
docker run -d --name frontend -p 8080:80 --network mynet frontend-image

# Run nginx
docker run -d --name nginx -p 80:80 --network mynet nginx-image

# Create network first...
# Remember all these commands... 😰
```

**With Docker Compose:**
```bash
docker-compose up
# That's it! 😊
```

---

## The docker-compose.yml File

This is a YAML file that defines your entire application stack.

### Basic Structure

```yaml
version: '3.8'          # Docker Compose version

services:               # Define all containers
  service1:
    # configuration for service 1
  service2:
    # configuration for service 2

networks:               # Define networks (optional)
  my-network:

volumes:                # Define volumes (optional)
  my-data:
```

---

## YAML Syntax Basics

YAML is sensitive to indentation (like Python).

**Rules:**
- Use **2 spaces** for indentation (not tabs!)
- `:` after a key (with a space after it)
- `-` for list items

**Example:**
```yaml
# Key-value pairs
name: student-api
port: 3000

# Nested objects (use indentation)
database:
  host: localhost
  port: 5432

# Lists
ports:
  - "3000:3000"
  - "4000:4000"

# List of objects
services:
  - name: backend
    port: 3000
  - name: frontend
    port: 80
```

---

## Service Definition

Each service represents a container.

### Complete Service Example

```yaml
services:
  backend:
    # Build from Dockerfile
    build: ./backend

    # Or use a pre-built image
    # image: node:18-alpine

    # Custom container name
    container_name: student-api

    # Port mapping (host:container)
    ports:
      - "3000:3000"

    # Volume mounts
    volumes:
      - ./backend/data:/app/data

    # Environment variables
    environment:
      - NODE_ENV=production
      - PORT=3000

    # Alternative env format
    # environment:
    #   NODE_ENV: production
    #   PORT: 3000

    # Or load from file
    # env_file:
    #   - .env

    # Restart policy
    restart: unless-stopped

    # Connect to networks
    networks:
      - app-network

    # Dependencies (startup order)
    depends_on:
      - database

    # Health check
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

---

## Our Project's docker-compose.yml Explained

Let's break down our actual file:

```yaml
version: '3.8'
```
**What it does:** Specifies Docker Compose file format version.
- Version 3.8 is stable and widely supported
- Different versions support different features

---

```yaml
services:
```
**What it does:** Starts the services section (list of all containers).

---

### Backend Service

```yaml
  backend:
    build: ./backend
```
**What it does:**
- Service name is `backend`
- Build image from `./backend/Dockerfile`
- Containers can reach this service at `http://backend:3000`

**Alternative:** Use pre-built image
```yaml
    image: my-registry/backend:latest
```

---

```yaml
    container_name: student-api
```
**What it does:** Sets a custom name for the container.
- Without this: Docker generates random names like `project_backend_1`
- With this: Container is named `student-api`
- Easier to use in `docker ps` and `docker logs`

---

```yaml
    ports:
      - "3000:3000"
```
**What it does:** Maps ports from host to container.
- Format: `"HOST:CONTAINER"`
- Left side (3000): Your computer
- Right side (3000): Inside container
- Access at: `http://localhost:3000`

**Examples:**
```yaml
ports:
  - "8080:80"      # localhost:8080 → container:80
  - "3000:3000"    # localhost:3000 → container:3000
  - "80:80"        # localhost:80 → container:80
```

---

```yaml
    volumes:
      - ./backend/data:/app/data
```
**What it does:** Mounts a directory from your computer into the container.
- Format: `HOST_PATH:CONTAINER_PATH`
- Left side (`./backend/data`): Your computer
- Right side (`/app/data`): Inside container
- Data persists even after container stops

**More on volumes:** See [06-volumes-guide.md](./06-volumes-guide.md)

---

```yaml
    environment:
      - NODE_ENV=development
      - PORT=3000
```
**What it does:** Sets environment variables inside the container.
- Format: `KEY=VALUE`
- Available to the application at runtime

**Alternative formats:**
```yaml
# Format 1: List
environment:
  - NODE_ENV=development
  - PORT=3000

# Format 2: Map
environment:
  NODE_ENV: development
  PORT: 3000

# Format 3: Load from file
env_file:
  - .env
```

---

```yaml
    restart: unless-stopped
```
**What it does:** Defines restart policy.

**Options:**
- `no`: Never restart (default)
- `always`: Always restart if it stops
- `on-failure`: Restart only if container exits with error
- `unless-stopped`: Always restart unless manually stopped

**When to use:**
- `unless-stopped`: For production apps (our choice)
- `always`: For critical services that must always run
- `on-failure`: For services that might crash temporarily
- `no`: For one-time tasks or testing

---

```yaml
    networks:
      - student-network
```
**What it does:** Connects the container to a custom network.
- Containers on the same network can communicate
- Use service names to connect: `http://backend:3000`

**More on networks:** See [05-networking-guide.md](./05-networking-guide.md)

---

```yaml
    depends_on:
      - backend
```
**What it does:** Defines startup order.
- `frontend` waits for `backend` to start
- Only waits for container to start, NOT for app to be ready

**Important:** `depends_on` doesn't guarantee the app is ready:
```yaml
# This only waits for container to start:
depends_on:
  - database

# To wait for app to be ready, use healthcheck:
depends_on:
  database:
    condition: service_healthy
```

---

### Networks Section

```yaml
networks:
  student-network:
    driver: bridge
```

**What it does:** Creates a custom network.
- `bridge`: Default driver for single-host networking
- All services on this network can communicate
- Isolated from other Docker networks

**Network drivers:**
- `bridge`: Single host (our case)
- `host`: Use host's network directly
- `overlay`: Multi-host (Docker Swarm)
- `none`: No networking

---

### Volumes Section

```yaml
volumes:
  backend-data:
```

**What it does:** Declares a named volume.
- Docker manages where it's stored
- Data persists across container recreations
- Shared between containers if needed

**Named volume vs Bind mount:**
```yaml
volumes:
  # Bind mount (absolute or relative path)
  - ./backend/data:/app/data

  # Named volume (Docker manages location)
  - backend-data:/app/data
```

---

## Common Docker Compose Patterns

### Using Environment Files

**.env file:**
```env
NODE_ENV=production
PORT=3000
DB_HOST=database
DB_PORT=5432
```

**docker-compose.yml:**
```yaml
services:
  backend:
    env_file:
      - .env
```

---

### Variable Substitution

**Use environment variables in docker-compose.yml:**

```yaml
services:
  backend:
    image: myapp:${TAG:-latest}  # Default to "latest" if TAG not set
    ports:
      - "${PORT:-3000}:3000"     # Default to 3000 if PORT not set
```

**Run with:**
```bash
TAG=v1.0 PORT=8080 docker-compose up
```

---

### Multiple Compose Files

**Base file (docker-compose.yml):**
```yaml
services:
  backend:
    build: ./backend
    environment:
      - NODE_ENV=development
```

**Override for production (docker-compose.prod.yml):**
```yaml
services:
  backend:
    environment:
      - NODE_ENV=production
    restart: always
```

**Run:**
```bash
# Development
docker-compose up

# Production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up
```

---

### Health Checks

```yaml
services:
  backend:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s       # Check every 30 seconds
      timeout: 10s        # Timeout after 10 seconds
      retries: 3          # Try 3 times before marking unhealthy
      start_period: 40s   # Wait 40s before starting checks
```

**Status indicators:**
- `starting`: Initial period
- `healthy`: Passed health check
- `unhealthy`: Failed health check

---

### Resource Limits

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '0.5'          # Max 50% of one CPU
          memory: 512M         # Max 512MB RAM
        reservations:
          cpus: '0.25'         # Reserve 25% CPU
          memory: 256M         # Reserve 256MB RAM
```

---

## Docker Compose Commands

### Start Services

```bash
# Start all services (foreground)
docker-compose up

# Start in detached mode (background)
docker-compose up -d

# Build images before starting
docker-compose up --build

# Start specific services
docker-compose up backend frontend
```

---

### Stop Services

```bash
# Stop all services (keeps containers)
docker-compose stop

# Stop and remove containers, networks
docker-compose down

# Stop and remove everything including volumes
docker-compose down -v

# Stop and remove everything including images
docker-compose down --rmi all
```

---

### View Services

```bash
# List running services
docker-compose ps

# List all services (including stopped)
docker-compose ps -a
```

---

### View Logs

```bash
# All service logs
docker-compose logs

# Follow logs (tail -f style)
docker-compose logs -f

# Logs for specific service
docker-compose logs backend

# Last 100 lines
docker-compose logs --tail 100 backend
```

---

### Execute Commands

```bash
# Run command in running service
docker-compose exec backend sh

# Run command in new container (service doesn't need to be running)
docker-compose run backend npm install

# Run without starting dependencies
docker-compose run --no-deps backend npm test
```

---

### Rebuild Services

```bash
# Rebuild all services
docker-compose build

# Rebuild without cache
docker-compose build --no-cache

# Rebuild specific service
docker-compose build backend
```

---

### Scale Services

```bash
# Run 3 instances of backend
docker-compose up --scale backend=3

# Note: Remove container_name when scaling
# (each instance needs unique name)
```

---

## Complete Workflow Example

**Typical development workflow:**

```bash
# 1. Start development environment
docker-compose up -d

# 2. View logs
docker-compose logs -f backend

# 3. Make code changes...

# 4. Rebuild and restart
docker-compose up -d --build

# 5. Run tests
docker-compose exec backend npm test

# 6. Check container status
docker-compose ps

# 7. Stop everything
docker-compose down
```

---

## Best Practices

### 1. Use Version Control for docker-compose.yml

```bash
git add docker-compose.yml
git commit -m "Add Docker Compose configuration"
```

### 2. Don't Commit .env Files

**.gitignore:**
```
.env
.env.local
.env.*.local
```

**.env.example (commit this):**
```env
NODE_ENV=development
PORT=3000
DB_HOST=database
# Add other variables with example values
```

### 3. Use Specific Image Tags

```yaml
# ❌ Bad: Tag can change
services:
  backend:
    image: node

# ✅ Good: Specific version
services:
  backend:
    image: node:18-alpine
```

### 4. Name Your Networks and Volumes

```yaml
# ✅ Descriptive names
networks:
  app-network:

volumes:
  db-data:
  redis-data:
```

### 5. Order Services by Dependencies

```yaml
# Layer architecture (bottom to top)
services:
  database:      # No dependencies
    # ...

  backend:       # Depends on database
    depends_on:
      - database

  frontend:      # Depends on backend
    depends_on:
      - backend

  nginx:         # Depends on frontend and backend
    depends_on:
      - frontend
      - backend
```

### 6. Use Health Checks for Critical Services

```yaml
services:
  database:
    healthcheck:
      test: ["CMD", "pg_isready"]
      interval: 10s

  backend:
    depends_on:
      database:
        condition: service_healthy
```

---

## Common Pitfalls

### 1. Indentation Errors

```yaml
# ❌ Wrong: Tabs or inconsistent spacing
services:
    backend:
  build: ./backend

# ✅ Correct: 2 spaces
services:
  backend:
    build: ./backend
```

### 2. Port Conflicts

```yaml
# ❌ Error if port 80 already used
ports:
  - "80:80"

# ✅ Use different host port
ports:
  - "8080:80"
```

### 3. Volume Path Issues

```yaml
# ❌ Absolute path (not portable)
volumes:
  - /home/user/project/data:/app/data

# ✅ Relative path (portable)
volumes:
  - ./data:/app/data
```

### 4. Environment Variable Quoting

```yaml
# ❌ Can cause parsing issues
environment:
  - MESSAGE=Hello world!

# ✅ Quote when needed
environment:
  - MESSAGE="Hello world!"
```

---

## Troubleshooting

### Services won't start?

```bash
# Check logs
docker-compose logs

# Check specific service
docker-compose logs backend

# Rebuild images
docker-compose up --build
```

### Port already in use?

```bash
# Find what's using the port
netstat -ano | findstr :3000

# Change port in docker-compose.yml
ports:
  - "3001:3000"
```

### Changes not reflected?

```bash
# Rebuild images
docker-compose up --build -d

# Or stop, rebuild, start
docker-compose down
docker-compose build
docker-compose up -d
```

### Can't connect between services?

- Check all services are on same network
- Use service name (not localhost)
- Check ports are correct

---

## Next Steps

- [05-networking-guide.md](./05-networking-guide.md) - Container networking
- [06-volumes-guide.md](./06-volumes-guide.md) - Data persistence
- [07-troubleshooting.md](./07-troubleshooting.md) - Common issues
