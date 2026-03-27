# On your server
cd ~
git clone <repository-url>
cd docker/Docke-Guide# Docker Basics

Welcome to the Docker basics guide! This document explains core Docker concepts in simple, beginner-friendly terms.

## What is Docker?

Docker is a platform that allows you to package your application and all its dependencies into a container. Think of it like a shipping container for your code - everything your application needs to run is bundled together.

### Why Do We Need Docker?

Imagine you build an application on your computer, and it works perfectly. But when your friend tries to run it, they get errors. This happens because:

- Your friend might have a different version of Node.js installed
- They might be missing some libraries
- Their operating system might be different (Windows vs Mac vs Linux)

**Docker solves this problem!** With Docker, you package your application along with everything it needs. Now, anyone with Docker can run your application exactly as you intended.

## Key Concepts

### 1. Images

**Think of an image as a recipe or blueprint.**

- An image contains instructions for creating a container
- It includes your code, dependencies, and configuration
- Images are **read-only** - they don't change
- You can create many containers from one image
- Images are like the "recipe" for baking a cake

**Example:**
```
Docker Image = Recipe for chocolate cake
(Flour, sugar, cocoa, eggs, instructions)
```

### 2. Containers

**Think of a container as the actual running application.**

- A container is created from an image
- It's a running instance of your application
- Containers are **isolated** from each other and your computer
- You can have multiple containers from the same image
- Containers are like actual "cakes" baked from the recipe

**Example:**
```
Docker Container = Actual chocolate cake
(Made using the recipe)
```

You can bake multiple cakes (containers) from the same recipe (image)!

### 3. The Relationship: Images vs Containers

Here's the simple relationship:

```
Image (Blueprint/Recipe)
    ↓
   Build/Create
    ↓
Container (Running Instance)
```

**Real-world analogy:**

| Concept | Image | Container |
|---------|-------|-----------|
| **House** | Architectural blueprint | Actual house built from blueprint |
| **Cooking** | Recipe | Actual dish made from recipe |
| **Music** | Sheet music | Actual performance |
| **Software** | Installed program | Running program |

### 4. Dockerfile

**A Dockerfile is like a recipe card with step-by-step instructions.**

It tells Docker how to build your image. It contains commands like:
- Which base image to use (like Node.js or Python)
- What files to copy
- What commands to run
- Which port to use

**Example Dockerfile:**
```dockerfile
FROM node:18-alpine    # Start with Node.js
COPY . /app            # Copy my code
RUN npm install        # Install dependencies
CMD ["node", "app.js"] # Run the application
```

## Why Use Docker? (Real Benefits)

### 1. Consistency
Your application runs the same everywhere - on your laptop, your friend's computer, or a server.

### 2. Isolation
Each container is isolated. If one crashes, others keep running.

### 3. Easy Setup
Instead of telling someone: "Install Node.js version 18, MySQL, then run these 10 commands..."

You just say: "Run `docker-compose up`"

### 4. Clean Computer
Docker containers are isolated. They don't clutter your computer with different versions of libraries and tools.

### 5. Easy Cleanup
Remove a container, and everything related to it is gone. No leftover files scattered across your system.

## Docker Architecture Overview

Docker uses a client-server architecture:

```
┌─────────────┐
│   Docker    │  (You type commands here)
│   Client    │
│   (CLI)     │
└──────┬──────┘
       │
       │ Commands (docker run, docker build, etc.)
       │
       ↓
┌─────────────┐
│   Docker    │  (The engine that does the work)
│   Daemon    │  (Runs in the background)
└──────┬──────┘
       │
       │ Manages
       │
       ↓
┌─────────────────────────────────┐
│  Images, Containers, Networks,  │
│  Volumes                         │
└─────────────────────────────────┘
```

**Simple explanation:**
1. You type a Docker command (like `docker run`)
2. Docker Client sends it to Docker Daemon
3. Docker Daemon does the actual work (creates container, downloads image, etc.)
4. Result is shown back to you

## Key Terminology

| Term | Simple Explanation | Analogy |
|------|-------------------|---------|
| **Image** | A packaged application with all dependencies | Recipe / Blueprint |
| **Container** | A running instance of an image | Actual dish / Built house |
| **Dockerfile** | Instructions to create an image | Recipe card |
| **Docker Hub** | Online library of pre-made images | App store for Docker images |
| **Volume** | Persistent storage for container data | External hard drive for container |
| **Network** | Communication channel between containers | Phone line between containers |
| **Port Mapping** | Making container accessible from outside | Opening a door to your house |
| **Docker Compose** | Tool to manage multiple containers | Orchestra conductor |

## How Docker Works in This Project

In our Student Management System:

1. **Backend Container**
   - Runs Node.js and Express
   - Stores data in MySQL database
   - Listens on port 3000

2. **Frontend Container**
   - Serves HTML, CSS, JavaScript files
   - Runs Nginx web server
   - Listens on port 80

3. **Nginx Reverse Proxy Container**
   - Routes requests to correct service
   - `/api/*` goes to backend
   - Everything else goes to frontend

4. **Docker Network**
   - All three containers can talk to each other
   - They use service names (backend, frontend, nginx)

5. **Volume**
   - MySQL database data is persistently stored
   - Data persists even if you stop containers

## The Docker Workflow

Here's how you'll typically work with Docker:

```
1. Write Dockerfile
        ↓
2. Build Image (docker build)
        ↓
3. Run Container (docker run)
        ↓
4. Test Application
        ↓
5. Make Changes to Code
        ↓
6. Rebuild Image
        ↓
7. Run New Container
```

For multiple containers, we use **Docker Compose** to simplify this:

```
1. Write docker-compose.yml
        ↓
2. Run: docker-compose up
        ↓
3. All containers start automatically!
```

## Common Questions

### Q: Is Docker a Virtual Machine?
**A:** No, but it's similar. Docker containers share the host's operating system kernel, making them much lighter and faster than virtual machines.

```
Virtual Machine:
┌─────────────────────┐
│    Application      │
│    Libraries        │
│    Guest OS         │ ← Full OS installed
│    Hypervisor       │
│    Host OS          │
└─────────────────────┘

Docker Container:
┌─────────────────────┐
│    Application      │
│    Libraries        │
│    Docker Engine    │
│    Host OS          │ ← Shares host OS
└─────────────────────┘
```

### Q: Do I need to install Node.js on my computer?
**A:** No! That's the beauty of Docker. Node.js is inside the container. Your computer only needs Docker.

### Q: What happens to my data when I stop a container?
**A:** Without volumes, data is lost. With volumes (like we use for MySQL), data persists in the database container.

### Q: Can containers talk to each other?
**A:** Yes! When containers are in the same Docker network, they can communicate using service names.

## Next Steps

Now that you understand the basics, move on to:

- [02-docker-commands.md](./02-docker-commands.md) - Learn all Docker commands
- [03-dockerfile-guide.md](./03-dockerfile-guide.md) - Master Dockerfile creation
- [04-docker-compose-guide.md](./04-docker-compose-guide.md) - Manage multiple containers

## Summary

- **Image** = Blueprint/Recipe (contains everything needed)
- **Container** = Running instance (actual application running)
- **Dockerfile** = Instructions to build an image
- **Docker Compose** = Tool to manage multiple containers
- **Volume** = Persistent storage
- **Network** = Communication between containers

Docker makes it easy to package, distribute, and run applications consistently across any environment!
