# Docker Volumes Guide

Volumes allow Docker containers to persist and share data. This guide explains everything about volumes in simple terms.

## The Problem: Container Data Loss

**By default, data inside containers is temporary:**

```bash
# Start container, add data
docker run -d --name myapp backend
# Container creates data...

# Stop and remove container
docker rm -f myapp

# Data is GONE! 😱
```

**Why?** Containers are designed to be ephemeral (temporary). When removed, everything inside disappears.

---

## The Solution: Volumes

**Volumes store data outside containers:**

```bash
# Start container with volume
docker run -d --name myapp -v mydata:/app/data backend
# Container creates data...

# Stop and remove container
docker rm -f myapp

# Start new container with same volume
docker run -d --name myapp2 -v mydata:/app/data backend
# Data is still there! 😊
```

**Think of volumes as external hard drives:**
- Container = Computer
- Volume = External hard drive
- You can plug the external drive into different computers
- Data persists even when computer is turned off

---

## Types of Volumes

### 1. Named Volumes (Recommended)

**What it is:** Docker manages where data is stored.

**Example:**
```yaml
services:
  backend:
    volumes:
      - backend-data:/app/data   # Named volume

volumes:
  backend-data:   # Declaration
```

**Pros:**
- ✅ Docker manages location
- ✅ Easy to backup
- ✅ Works on all operating systems
- ✅ Better performance

**Cons:**
- ❌ Can't easily browse files from your computer

---

### 2. Bind Mounts

**What it is:** Mount a specific folder from your computer.

**Example:**
```yaml
services:
  backend:
    volumes:
      - ./backend/data:/app/data   # Bind mount
```

**Pros:**
- ✅ Easy to access files from your computer
- ✅ Can edit files directly
- ✅ Good for development

**Cons:**
- ❌ Path might not exist on all systems
- ❌ Slower on Mac/Windows (due to file system differences)

---

### 3. tmpfs Mounts (Advanced)

**What it is:** Temporary storage in memory (RAM).

**When to use:** For sensitive temporary data.

**Example:**
```yaml
services:
  backend:
    tmpfs:
      - /tmp
```

**Note:** Data disappears when container stops.

---

## Our Project's Volume Usage

**We use named volumes for MySQL database:**

```yaml
services:
  mysql-db:
    volumes:
      - mysql-data:/var/lib/mysql

volumes:
  mysql-data:
    driver: local
```

**What this does:**
- `mysql-data`: Named volume managed by Docker
- `/var/lib/mysql`: MySQL's data directory inside container
- Database data is stored persistently in Docker-managed volume

**Why use named volume here?**
- Better performance than bind mounts
- Docker manages backup and migration
- More secure (no direct file system access)
- Production-ready approach

---

## Volume Syntax

### Format: `SOURCE:TARGET[:OPTIONS]`

```yaml
volumes:
  - source:target:options
```

**Parts:**
1. **Source:** Where data comes from
2. **Target:** Where data appears in container
3. **Options:** Additional flags (optional)

---

### Named Volume Example

```yaml
volumes:
  - mydata:/app/data
```
- Source: `mydata` (Docker manages where it's stored)
- Target: `/app/data` (inside container)

---

### Bind Mount Example

```yaml
volumes:
  - ./my-folder:/app/folder
```
- Source: `./my-folder` (on your computer)
- Target: `/app/folder` (inside container)

**Note:** Relative paths (`./`) work with Docker Compose. In `docker run`, use absolute paths:
```bash
# Docker run needs absolute path
docker run -v /full/path/to/folder:/app/data myapp
```

---

### Read-Only Volumes

```yaml
volumes:
  - ./config:/app/config:ro
```
- `:ro` = read-only
- Container can't modify files
- Good for configuration files

---

## How Volumes Work

### Named Volume Lifecycle

```
┌──────────────────────────────────────┐
│  Your Computer                        │
│                                       │
│  Docker Volume Storage                │
│  (managed by Docker)                  │
│  C:\ProgramData\docker\volumes\...    │
│                                       │
│  ┌────────────────────────────────┐  │
│  │  mydata                        │  │
│  │  ├── file1.db                  │  │
│  │  └── file2.log                 │  │
│  └────────┬───────────────────────┘  │
│           │                           │
│           │ Mount                     │
│           ↓                           │
│  ┌────────────────────────────────┐  │
│  │  Container                     │  │
│  │  /app/data                     │  │
│  │  ├── file1.db                  │  │
│  │  └── file2.log                 │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

---

### Bind Mount Lifecycle

```
┌──────────────────────────────────────┐
│  Your Computer                        │
│                                       │
│  ./backend/data/                      │
│  ├── students.db                      │
│  └── backup.db                        │
│           │                           │
│           │ Mount                     │
│           ↓                           │
│  ┌────────────────────────────────┐  │
│  │  Container                     │  │
│  │  /app/data/                    │  │
│  │  ├── students.db                │  │
│  │  └── backup.db                  │  │
│  └────────────────────────────────┘  │
│                                       │
│  Changes in container appear on       │
│  your computer immediately! ↔        │
└──────────────────────────────────────┘
```

---

## Volume Commands

### List volumes
```bash
docker volume ls
```

**Output:**
```
DRIVER    VOLUME NAME
local     backend-data
local     postgres-data
```

---

### Inspect volume
```bash
docker volume inspect backend-data
```

**Output:**
```json
[
    {
        "CreatedAt": "2024-03-25T10:00:00Z",
        "Driver": "local",
        "Mountpoint": "/var/lib/docker/volumes/backend-data/_data",
        "Name": "backend-data",
        "Scope": "local"
    }
]
```

Shows where Docker stores the data.

---

### Create volume
```bash
docker volume create mydata
```

Usually not needed (Docker Compose creates them automatically).

---

### Remove volume
```bash
docker volume rm mydata
```

**⚠️ Warning:** This deletes all data!

---

### Remove all unused volumes
```bash
docker volume prune
```

**⚠️ Warning:** Deletes volumes not attached to any container!

---

### Remove volumes when stopping
```bash
# Remove containers and volumes
docker-compose down -v
```

---

## Data Persistence in Our Project

**MySQL database persists between restarts:**

```bash
# 1. Start application
docker-compose up -d

# 2. Add some students via the web interface
# Data is saved to MySQL database in named volume

# 3. Stop all containers
docker-compose down

# 4. Start again
docker-compose up -d

# 5. Students are still there! ✅
```

**Why?** The named volume `mysql-data` persists MySQL data between container restarts. Docker manages this volume independently of container lifecycle.

---

## Volume Use Cases

### Use Case 1: Database Storage

```yaml
services:
  postgres:
    image: postgres
    volumes:
      - db-data:/var/lib/postgresql/data

volumes:
  db-data:
```

**Why:** Database must persist even after container restart.

---

### Use Case 2: Configuration Files

```yaml
services:
  nginx:
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
```

**Why:** Easy to edit config without rebuilding image. `:ro` prevents container from modifying it.

---

### Use Case 3: Log Files

```yaml
services:
  app:
    volumes:
      - ./logs:/app/logs
```

**Why:** Easy to access and analyze logs from your computer.

---

### Use Case 4: Development Code (Hot Reload)

```yaml
services:
  backend:
    volumes:
      - ./backend:/app
    command: npm run dev
```

**Why:** Code changes on your computer instantly appear in container. Useful for development.

---

### Use Case 5: Shared Data Between Containers

```yaml
services:
  app1:
    volumes:
      - shared-data:/data

  app2:
    volumes:
      - shared-data:/data

volumes:
  shared-data:
```

**Why:** Both containers can read/write the same data.

---

## Named Volumes vs Bind Mounts

### When to use Named Volumes

✅ **Use for:**
- Production databases
- Data that doesn't need frequent access from host
- Cross-platform compatibility
- Better performance

```yaml
volumes:
  - db-data:/var/lib/postgresql/data

volumes:
  db-data:
```

---

### When to use Bind Mounts

✅ **Use for:**
- Development (code changes)
- Configuration files
- Logs you want to read easily
- When you need to edit files from your computer

```yaml
volumes:
  - ./backend:/app
  - ./config:/etc/app/config:ro
  - ./logs:/var/log/app
```

---

## Volume Permissions

### Linux Permission Issues

**Problem:** Container runs as root but your user can't access files.

**Solution 1: User mapping in Dockerfile**
```dockerfile
# Create user with specific UID
RUN useradd -u 1000 appuser
USER appuser
```

**Solution 2: Change folder ownership**
```bash
sudo chown -R $USER:$USER ./backend/data
```

---

### Windows Permission Issues

Usually not an issue on Windows (Docker Desktop handles it).

---

## Backup and Restore

### Backup Named Volume

```bash
# Start a temporary container to copy data out
docker run --rm -v mydata:/data -v $(pwd):/backup ubuntu tar czf /backup/mydata-backup.tar.gz /data
```

---

### Restore Named Volume

```bash
# Create volume
docker volume create mydata

# Start a temporary container to copy data in
docker run --rm -v mydata:/data -v $(pwd):/backup ubuntu tar xzf /backup/mydata-backup.tar.gz -C /
```

---

### Backup Bind Mount

**Easy! Just copy the folder:**
```bash
# Linux/Mac
cp -r ./backend/data ./backend/data-backup

# Windows
xcopy .\backend\data .\backend\data-backup /E /I
```

---

## Volume Best Practices

### 1. Use named volumes for production data

```yaml
# ✅ Good for production
volumes:
  - db-data:/var/lib/postgresql/data

volumes:
  db-data:
```

---

### 2. Use bind mounts for development

```yaml
# ✅ Good for development
volumes:
  - ./backend:/app
  - ./logs:/var/log/app
```

---

### 3. Make configuration files read-only

```yaml
volumes:
  - ./nginx.conf:/etc/nginx/nginx.conf:ro
```

---

### 4. Document what each volume is for

```yaml
volumes:
  # Database files (CRITICAL - do not delete!)
  - db-data:/var/lib/postgres/data

  # Application logs (can be deleted safely)
  - ./logs:/app/logs

  # User uploads (IMPORTANT - backup regularly)
  - uploads:/app/uploads
```

---

### 5. Include volumes in .gitignore

**.gitignore:**
```
# Data files (legacy - now using MySQL volumes)
data/
*.db

# Logs
logs/
*.log

# Uploads
uploads/

# Keep directory structure
!data/.gitkeep
```

---

### 6. Back up important data regularly

```bash
# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar czf backup-$DATE.tar.gz ./backend/data
```

---

## Troubleshooting

### Data not persisting?

**Check volume is mounted:**
```bash
docker inspect mycontainer
```

Look for `"Mounts"` section.

---

### Permission denied?

**Linux:** Check file permissions
```bash
ls -la ./backend/data
```

**Fix:**
```bash
sudo chown -R $USER:$USER ./backend/data
```

---

### Volume is empty?

**Check path is correct:**
```yaml
# ✅ Correct
volumes:
  - ./backend/data:/app/data

# ❌ Wrong path
volumes:
  - ./data:/app/data   # ./data doesn't exist!
```

---

### Can't find volume data?

**For named volumes:**
```bash
# Find mount point
docker volume inspect mydata

# Output shows:
# "Mountpoint": "/var/lib/docker/volumes/mydata/_data"
```

---

### Changes not appearing?

**For bind mounts:** Make sure Docker has file sharing enabled.

**Docker Desktop → Settings → Resources → File Sharing**
- Add your project folder

---

## Summary

**Key Concepts:**

| Type | What It Is | When to Use |
|------|------------|-------------|
| **Named Volume** | Docker manages location | Production databases, persistent data |
| **Bind Mount** | Specific folder from your computer | Development, configs, logs |
| **tmpfs** | Temporary memory storage | Sensitive temporary data |

**Quick Reference:**

```yaml
# Named volume
volumes:
  - mydata:/app/data
volumes:
  mydata:

# Bind mount (development)
volumes:
  - ./local-folder:/container-folder

# Read-only
volumes:
  - ./config:/app/config:ro

# Shared between services
services:
  app1:
    volumes:
      - shared:/data
  app2:
    volumes:
      - shared:/data
volumes:
  shared:
```

---

## Next Steps

- [04-docker-compose-guide.md](./04-docker-compose-guide.md) - Multi-container apps
- [05-networking-guide.md](./05-networking-guide.md) - Container communication
- [07-troubleshooting.md](./07-troubleshooting.md) - Common issues
