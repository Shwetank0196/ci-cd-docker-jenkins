# Docker Networking Guide

Docker networking allows containers to communicate with each other and the outside world. This guide explains networking concepts in simple terms.

## What is Docker Networking?

**Think of Docker networking like a neighborhood:**
- Each house (container) has an address
- Houses can talk to each other on the same street (network)
- Some houses have mailboxes on the main road (port mapping) so people from outside can reach them

---

## Why Do Containers Need Networking?

**Problem without networking:**
- Containers are isolated by default
- They can't talk to each other
- They can't be accessed from outside

**Solution with networking:**
- Containers can communicate using service names
- Port mapping allows access from your computer
- Different networks provide isolation

---

## Types of Docker Networks

### 1. Bridge Network (Default)

**What it is:** The default network for containers on a single host.

**When to use:** Multi-container applications on one machine (our project!).

**How it works:**
```
Your Computer
    ↓
Docker Bridge Network
    ├── Container 1 (backend)
    ├── Container 2 (frontend)
    └── Container 3 (nginx)
```

All containers can talk to each other using service names.

**Example:**
```yaml
networks:
  app-network:
    driver: bridge
```

---

### 2. Host Network

**What it is:** Container uses the host's network directly (no isolation).

**When to use:** When you need maximum network performance or need to bind to many ports.

**Example:**
```yaml
services:
  app:
    network_mode: host
```

**Trade-off:** Less isolation, but better performance.

---

### 3. None Network

**What it is:** Container has no network access.

**When to use:** When you want complete network isolation.

**Example:**
```yaml
services:
  app:
    network_mode: none
```

---

### 4. Overlay Network

**What it is:** Multi-host networking for Docker Swarm.

**When to use:** When containers run on different physical machines.

**We don't need this for our project** (single machine only).

---

## How Containers Communicate

### 1. Container-to-Container (Same Network)

Containers on the same network can communicate using **service names**.

**Our project example:**

```yaml
services:
  backend:
    networks:
      - app-network

  frontend:
    networks:
      - app-network
```

**Inside frontend container, to reach backend:**
```javascript
// ✅ Use service name
fetch('http://backend:3000/students')

// ❌ Don't use localhost
fetch('http://localhost:3000/students')  // Won't work!
```

**How it works:**
- Docker has built-in DNS
- Service name `backend` resolves to backend container's IP
- Like using a phone book: name → phone number

---

### 2. Container-to-Host

**Accessing services on your computer from inside a container:**

```javascript
// Inside container, to reach your computer:
// Use special host: host.docker.internal
fetch('http://host.docker.internal:5000')
```

**When to use:**
- Development: connecting to database on your computer
- Accessing services not in Docker

---

### 3. Host-to-Container (Port Mapping)

**Accessing containers from your computer requires port mapping.**

**Without port mapping:**
```yaml
services:
  backend:
    # Port 3000 exposed but not accessible from outside
    expose:
      - "3000"
```

**With port mapping:**
```yaml
services:
  backend:
    # Port 3000 accessible at localhost:3000
    ports:
      - "3000:3000"
```

**Access from your computer:**
```bash
curl http://localhost:3000
```

---

## Port Mapping Explained

### Format: `HOST:CONTAINER`

```yaml
ports:
  - "3000:3000"
```

**Reading left-to-right:**
- **Left side (3000):** Port on your computer
- **Right side (3000):** Port inside container

**What it means:**
"When I access `localhost:3000` on my computer, forward it to port `3000` inside the container."

---

### Examples

**Example 1: Same port**
```yaml
ports:
  - "3000:3000"
```
- Container listens on port 3000
- Access at: `localhost:3000`

---

**Example 2: Different port**
```yaml
ports:
  - "8080:3000"
```
- Container listens on port 3000
- Access at: `localhost:8080` (not 3000!)

---

**Example 3: Multiple ports**
```yaml
ports:
  - "3000:3000"
  - "3001:3001"
  - "8080:80"
```
- Three ports mapped
- Container has services on ports 3000, 3001, and 80
- Access at: `localhost:3000`, `localhost:3001`, `localhost:8080`

---

**Example 4: Specific IP**
```yaml
ports:
  - "127.0.0.1:3000:3000"
```
- Only accessible from localhost (not other computers on network)

---

### Port Mapping vs Expose

**`expose`:** Documents port (container-to-container only)
```yaml
services:
  backend:
    expose:
      - "3000"
    networks:
      - app-network

  frontend:
    # Can access backend:3000 from here
    networks:
      - app-network
```
- ✅ Other containers can access
- ❌ Your computer cannot access

---

**`ports`:** Maps port (accessible from your computer)
```yaml
services:
  backend:
    ports:
      - "3000:3000"
```
- ✅ Other containers can access
- ✅ Your computer can access at `localhost:3000`

---

## Our Project's Network Architecture

```
┌─────────────────────────────────────────────┐
│          Your Computer (localhost)          │
│                                             │
│  Browser → http://localhost                 │
│              |                              │
│              ↓                              │
│  ┌────────────────────────────────────────┐ │
│  │     Docker Bridge Network              │ │
│  │     (student-network)                  │ │
│  │                                        │ │
│  │  ┌──────────┐      ┌──────────┐      │ │
│  │  │  Nginx   │      │ Frontend │      │ │
│  │  │  :80     │←────→│  :80     │      │ │
│  │  └────┬─────┘      └──────────┘      │ │
│  │       │                               │ │
│  │       ↓                               │ │
│  │  ┌──────────┐                        │ │
│  │  │ Backend  │                        │ │
│  │  │  :3000   │                        │ │
│  │  └──────────┘                        │ │
│  │                                        │ │
│  └────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘

Port Mapping:
- localhost:80     → nginx:80
- localhost:8080   → frontend:80
- localhost:3000   → backend:3000
```

---

## How Nginx Reverse Proxy Works

**What is a reverse proxy?**
Think of it like a receptionist at a company:
- You call the main number (Nginx)
- Receptionist forwards you to correct department (backend/frontend)

**Our Nginx configuration:**
```nginx
# Requests to /api/* go to backend
location /api/ {
    proxy_pass http://backend/;
}

# All other requests go to frontend
location / {
    proxy_pass http://frontend/;
}
```

**Traffic flow:**

```
User Request: http://localhost/api/students
    ↓
Nginx (port 80)
    ↓ (checks URL path)
    ↓ (matches /api/)
    ↓
Backend (http://backend:3000/students)
    ↓
Response back to user
```

**Why use service name `backend`?**
- Docker DNS resolves `backend` to backend container's IP
- No need to know the IP address
- Works even if IP changes

---

## Service Name Resolution

**How Docker DNS works:**

```yaml
services:
  backend:
    container_name: student-api
    networks:
      - app-network

  frontend:
    networks:
      - app-network
```

**Inside frontend container:**
```bash
# These all work:
ping backend           # Service name works! ✅
ping student-api       # Container name works! ✅

# This doesn't work:
ping localhost        # Only reaches itself ❌
```

**Docker automatically:**
1. Registers service names in internal DNS
2. Resolves `backend` → IP address of backend container
3. Services can find each other by name

---

## Network Isolation

Containers on different networks can't communicate.

**Example: Isolating services**

```yaml
services:
  # Public-facing services
  frontend:
    networks:
      - public-network

  nginx:
    networks:
      - public-network
      - private-network   # Connected to both!

  # Internal services (not directly accessible)
  backend:
    networks:
      - private-network

  database:
    networks:
      - private-network

networks:
  public-network:
  private-network:
```

**Result:**
- Frontend can only talk to Nginx
- Backend and database are isolated
- Only Nginx can reach backend

---

## Common Network Patterns

### Pattern 1: All services on one network (Simple)

```yaml
services:
  backend:
    networks:
      - app-network

  frontend:
    networks:
      - app-network

  database:
    networks:
      - app-network

networks:
  app-network:
```

**Pros:** Simple, easy to understand
**Cons:** No isolation between services

---

### Pattern 2: Multiple networks (Better security)

```yaml
services:
  frontend:
    networks:
      - frontend-network

  backend:
    networks:
      - frontend-network
      - backend-network

  database:
    networks:
      - backend-network

networks:
  frontend-network:  # Public
  backend-network:   # Private
```

**Pros:** Better security, limited access
**Cons:** More complex

---

## Network Commands

### List networks
```bash
docker network ls
```

### Inspect network
```bash
docker network inspect student-network
```
**Shows:**
- IP range
- Connected containers
- Gateway
- Subnet

### Create network
```bash
docker network create my-network
```

### Connect container to network
```bash
docker network connect my-network my-container
```

### Disconnect from network
```bash
docker network disconnect my-network my-container
```

### Remove network
```bash
docker network rm my-network
```

---

## DNS Resolution Example

**Test DNS resolution inside a container:**

```bash
# Start the containers
docker-compose up -d

# Enter the frontend container
docker-compose exec frontend sh

# Install curl (if not available)
apk add curl

# Test: Can we reach backend?
curl http://backend:3000/health

# Output: {"status":"OK","message":"Student API is running"}

# Test: DNS lookup
nslookup backend

# Output shows backend's IP address
```

---

## Network Debugging

### Container can't reach another container?

**Check 1: Are they on the same network?**
```bash
docker network inspect student-network
```

**Check 2: Is the target container running?**
```bash
docker-compose ps
```

**Check 3: Use service name, not localhost**
```javascript
// ✅ Correct
fetch('http://backend:3000')

// ❌ Wrong
fetch('http://localhost:3000')
```

---

### Can't access container from host?

**Check 1: Is port mapped?**
```yaml
# ✅ Correct (mapped)
ports:
  - "3000:3000"

# ❌ Wrong (not mapped)
expose:
  - "3000"
```

**Check 2: Is container running?**
```bash
docker ps
```

**Check 3: Is port correct?**
```bash
curl http://localhost:3000
```

---

### Port already in use?

**Find what's using it:**
```bash
# Windows
netstat -ano | findstr :3000

# Mac/Linux
lsof -i :3000
```

**Solution: Use different port**
```yaml
ports:
  - "3001:3000"  # Use 3001 instead
```

---

## Best Practices

### 1. Use named networks

```yaml
# ✅ Good: Named network
networks:
  app-network:

# ❌ Avoid: Default network
# (implicit, less control)
```

---

### 2. Use service names, not IPs

```javascript
// ✅ Good: Service name
fetch('http://backend:3000')

// ❌ Bad: IP address (can change)
fetch('http://172.18.0.2:3000')
```

---

### 3. Don't map ports unless needed

```yaml
# Backend doesn't need to be directly accessible
backend:
  # expose: "3000"  # Implicit, other containers can still reach it
  networks:
    - app-network

# Only Nginx needs port mapping
nginx:
  ports:
    - "80:80"
  networks:
    - app-network
```

---

### 4. Use multiple networks for security

Isolate sensitive services (databases) on separate networks.

---

### 5. Document port usage

```yaml
services:
  backend:
    # API server
    ports:
      - "3000:3000"  # HTTP API

  frontend:
    # Static files
    ports:
      - "8080:80"    # Web interface
```

---

## Summary

**Key Concepts:**
1. **Bridge Network:** Default network type, containers on same host
2. **Service Names:** Containers use names to find each other (DNS)
3. **Port Mapping:** Makes containers accessible from your computer
4. **Isolation:** Different networks isolate containers

**Quick Reference:**

| Need | Solution |
|------|----------|
| Container → Container | Service name (`http://backend:3000`) |
| Host → Container | Port mapping (`ports: "3000:3000"`) |
| Container → Host | `host.docker.internal` |
| Network isolation | Multiple networks |

---

## Next Steps

- [06-volumes-guide.md](./06-volumes-guide.md) - Data persistence
- [04-docker-compose-guide.md](./04-docker-compose-guide.md) - Multi-container apps
- [07-troubleshooting.md](./07-troubleshooting.md) - Common networking issues
