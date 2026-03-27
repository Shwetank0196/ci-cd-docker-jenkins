# Docker Beginner's Guide

## 1. Introduction

### What is Docker?

Docker is like a **lightweight virtual box** that packages your application with everything it needs to run - code, libraries, and system tools. Think of it as a container that holds your app and all its dependencies together.

**Real-world analogy:** Imagine shipping a physical product. You put it in a container with all the packaging materials it needs. No matter where you ship it, the product arrives safely and works the same way. Docker does the same for software.

### Why Use Docker?

- **Works everywhere:** "It works on my machine" problem solved! If it runs in a Docker container on your laptop, it will run the same way on any server.
- **Easy setup:** No need to install tons of dependencies. Just run the container.
- **Isolated environments:** Each container runs independently without affecting others.
- **Saves time:** Share your work with others easily, and they can run it instantly.

---

## 2. Basic Docker Commands

### Check Docker Version

```bash
docker --version
```

**What it does:** Shows which version of Docker you have installed.

**Example output:**
```
Docker version 24.0.7, build afdd53b
```

---

### Run Hello World

```bash
docker run hello-world
```

**What it does:** Downloads and runs a test container to verify Docker is working correctly.

**Use case:** This is your first Docker command to confirm everything is set up properly.

---

### Pull an Image

```bash
docker pull nginx
```

**What it does:** Downloads an image from Docker Hub (online storage for Docker images) to your computer.

**Example:** This downloads the nginx web server image.

**Why use it:** Before running a container, you need its image. This command downloads it without running it immediately.

---

### Docker Hub Basics

#### What is Docker Hub?

Docker Hub is like the "App Store" for Docker images. It's an online library where you can find thousands of pre-built images.

**Website:** https://hub.docker.com

#### Finding Images

**Search from command line:**
```bash
docker search nginx
```

**Search on Docker Hub website:**
- Go to hub.docker.com
- Search for "nginx", "postgres", "node", etc.

#### Understanding Image Tags

Images have versions called **tags**.

**Format:** `image-name:tag`

**Examples:**
```bash
docker pull nginx:latest        # Latest version (default)
docker pull nginx:1.25.3        # Specific version
docker pull postgres:15         # Postgres version 15
docker pull node:18-alpine      # Node.js 18 on Alpine Linux (smaller)
```

**Why use specific tags:**
- `latest` might change, breaking your app
- Specific versions ensure consistency
- Good practice: always specify the version

**Example:**
```bash
# Not recommended (unpredictable)
docker pull nginx:latest

# Recommended (predictable)
docker pull nginx:1.25.3
```

---

### Run a Container

```bash
docker run nginx
```

**What it does:** Creates and starts a container from an image.

**Better example with port mapping:**
```bash
docker run -p 8080:80 nginx
```

**Explanation:**
- `-p 8080:80` maps port 80 inside the container to port 8080 on your computer
- Now you can visit `http://localhost:8080` in your browser to see nginx running!

**Run in background:**
```bash
docker run -d -p 8080:80 nginx
```
- `-d` runs the container in detached mode (background)

---

### Name Your Container

```bash
docker run -d -p 8080:80 --name my-web-server nginx
```

**What it does:** Gives your container a friendly name instead of a random one.

**Why use it:**
- Easier to remember than random IDs
- Easier to stop/start: `docker stop my-web-server`
- Makes command clearer: You know what the container does

**Example:**
```bash
# Without name - hard to identify
docker stop silly_einstein

# With name - clear and easy
docker stop my-web-server
```

---

### List Running Containers

```bash
docker ps
```

**What it does:** Shows all currently running containers.

**Example output:**
```
CONTAINER ID   IMAGE     COMMAND                  CREATED         STATUS         PORTS                  NAMES
abc123def456   nginx     "nginx -g 'daemon of…"   2 minutes ago   Up 2 minutes   0.0.0.0:8080->80/tcp   silly_einstein
```

---

### List All Containers (Including Stopped)

```bash
docker ps -a
```

**What it does:** Shows all containers, both running and stopped.

**Use case:** See containers that have exited or stopped.

---

### Stop a Container

```bash
docker stop abc123def456
```

**What it does:** Gracefully stops a running container.

**Example:** Replace `abc123def456` with the actual container ID from `docker ps`.

**Tip:** You can use just the first few characters of the ID:
```bash
docker stop abc
```

---

### Start a Stopped Container

```bash
docker start abc123def456
```

**What it does:** Restarts a container that was previously stopped.

**Difference from `docker run`:** This starts an existing container. `docker run` creates a new one.

---

### Remove a Container

```bash
docker rm abc123def456
```

**What it does:** Deletes a stopped container.

**Note:** The container must be stopped first. To force remove:
```bash
docker rm -f abc123def456
```

---

### Remove an Image

```bash
docker rmi nginx
```

**What it does:** Deletes an image from your computer.

**Use case:** Free up disk space by removing images you no longer need.

**Note:** All containers using this image must be removed first.

---

### Execute Command Inside Container

```bash
docker exec -it abc123def456 bash
```

**What it does:** Opens a terminal inside a running container.

**Explanation:**
- `-it` makes it interactive (you can type commands)
- `bash` opens a bash shell
- Now you're "inside" the container!

**Example use case:**
```bash
docker exec -it abc123def456 ls
```
This lists files inside the container without entering it.

**To exit:** Type `exit` and press Enter.

---

### View Container Logs

```bash
docker logs abc123def456
```

**What it does:** Shows the output (logs) from a container.

**Use case:** Debugging - see what's happening inside your container, find errors.

**Example:**
```bash
# See all logs
docker logs my-web-server

# Follow logs in real-time (like tail -f)
docker logs -f my-web-server

# Show only last 50 lines
docker logs --tail 50 my-web-server
```

**Real-world use:**
```bash
docker run -d --name test-nginx nginx
docker logs test-nginx
```

You'll see nginx startup messages, access logs, and any errors.

---

### Common Docker Run Flags

Here's a quick reference of the most useful flags:

| Flag | What it Does | Example |
|------|-------------|---------|
| `-d` | Run in background (detached) | `docker run -d nginx` |
| `-p` | Map ports (host:container) | `docker run -p 8080:80 nginx` |
| `--name` | Give container a name | `docker run --name web nginx` |
| `-e` | Set environment variable | `docker run -e API_KEY=secret nginx` |
| `-v` | Mount volume (share files) | `docker run -v ./data:/app/data nginx` |
| `-it` | Interactive terminal | `docker run -it ubuntu bash` |
| `--rm` | Auto-remove when stopped | `docker run --rm nginx` |
| `--network` | Connect to network | `docker run --network my-net nginx` |

**Combine multiple flags:**
```bash
docker run -d -p 8080:80 --name my-app -e NODE_ENV=production my-image
```

---

## 3. Docker Images

### What is a Docker Image?

An image is like a **blueprint** or **recipe** for creating containers. It contains:
- Your application code
- Dependencies and libraries
- System tools
- Configuration files

**Analogy:** If a container is a cake, then an image is the recipe for that cake.

---

### Creating Your Own Image with Dockerfile

A **Dockerfile** is a text file with instructions to build an image.

#### Simple Dockerfile Example

Let's create a simple web application:

**Dockerfile:**
```dockerfile
# Use an existing image as the base
FROM nginx:latest

# Copy your files into the container
COPY index.html /usr/share/nginx/html/

# Expose port 80
EXPOSE 80

# Command to run when container starts
CMD ["nginx", "-g", "daemon off;"]
```

#### What Each Line Does:

1. **FROM nginx:latest**
   - Start with the official nginx image
   - `latest` means the newest version

2. **COPY index.html /usr/share/nginx/html/**
   - Copy your `index.html` file from your computer into the container
   - `/usr/share/nginx/html/` is where nginx looks for web files

3. **EXPOSE 80**
   - Tell Docker this container will listen on port 80
   - This is documentation, not actual port mapping

4. **CMD ["nginx", "-g", "daemon off;"]**
   - The command to run when the container starts
   - This starts the nginx web server

---

### Building an Image

Create a folder and two files:
```bash
mkdir my-docker-app
cd my-docker-app
```

```
my-docker-app/
├── Dockerfile
└── index.html
```

---

Create a simple `index.html` file first:

**index.html:**
```html
<!DOCTYPE html>
<html>
<head>
    <title>My Docker App</title>
</head>
<body>
    <h1>Hello from Docker!</h1>
    <p>This is my first Docker application.</p>
</body>
</html>
```

**Dockerfile:**
```dockerfile
FROM nginx:latest

COPY index.html /usr/share/nginx/html/index.html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### ** Build the Image**

```bash
docker build -t my-nginx-app .
```

**What this does:**
- `-t my-nginx-app` = Name your new image "my-nginx-app"
- `.` = Use Dockerfile in current directory
- Creates an image containing nginx + your HTML file

**Important:** Don't forget the dot (`.`) at the end!

**Verify it worked:**
```bash
docker images
```
You should see `my-nginx-app` in the list.

**Run your custom image:**
```bash
docker run -d -p 8080:80 --name my-web-app my-nginx-app
```

**What this does:**
- `-d` = Run in background
- `-p 8080:80` = Map port 8080 (your computer) to port 80 (container)
- `--name my-web-app` = Name the container
- `my-nginx-app` = Use YOUR image (not the base nginx image)

---

Now visit `http://localhost:8080` to see your custom page!

---

## 4. Intermediate Concepts

#### What is Docker Networking?

Docker networking allows containers to communicate with each other by name, just like computers on a network.

**Real-world example:**
- Your **backend app** (Node.js/Python) needs to connect to a **database** (MySQL/Postgres)
- Your **frontend** needs to call your **backend API**
- Without networking, containers are isolated and can't find each other

**Think of it like:** Houses on a street. Without addresses, you can't visit your neighbor. Docker networks give containers "addresses" so they can talk to each other.

---

#### BEFORE: The Problem (Without Custom Network)

Let's see what happens when we DON'T use a custom network.

**Step 1: Run two containers without a custom network**

```bash
# Start first container
docker run -dit --name container1 busybox sh

# Start second container
docker run -dit --name container2 busybox sh
```

**What we did:**
- Created 2 simple containers using `busybox` (a minimal Linux image)
- `-dit` = detached + interactive + terminal (runs in background but keeps shell open)

**Step 2: Try to ping container2 from container1 by name**

```bash
docker exec -it container1 ping container2
```

**Result: ❌ FAILS**
```
ping: bad address 'container2'
```

**Why it fails:**
- By default, containers are on Docker's default bridge network
- The default bridge network **does NOT support DNS resolution by container name**
- Containers can only communicate using IP addresses on the default network

**Step 3: Try with IP address (it works, but not practical)**

First, find container2's IP:
```bash
docker inspect container2 | grep IPAddress
```

Output:
```
"IPAddress": "172.17.0.3"
```

Now ping by IP:
```bash
docker exec -it container1 ping 172.17.0.3
```

**Result: ✅ This works, but...**
- IPs change every time you restart containers
- Hard to remember and manage
- Not practical for real applications

**The Problem:** Default bridge is not suitable for production apps!

**Clean up:**
```bash
docker rm -f container1 container2
```

---

#### SOLUTION: Custom Network (The Right Way)

Custom networks enable **automatic DNS resolution** by container name.

**Step 1: Create a custom network**

```bash
docker network create my-network
```

**What this does:**
- Creates a bridge network named `my-network`
- Enables DNS resolution (containers can find each other by name)
- Isolates your containers from others

**Verify it was created:**
```bash
docker network ls
```

Output:
```
NETWORK ID     NAME         DRIVER    SCOPE
abc123def456   bridge       bridge    local
xyz789abc123   my-network   bridge    local
```

---

**Step 2: Run containers on the custom network**

```bash
# Start container1 on my-network
docker run -dit --name c1 --network my-network busybox sh

# Start container2 on my-network
docker run -dit --name c2 --network my-network busybox sh
```

**What changed:**
- Added `--network my-network` flag
- Both containers are now on the same custom network

---

**Step 3: Test communication by container name**

```bash
# From c1, ping c2 by name
docker exec -it c1 ping c2
```

**Result: ✅ SUCCESS!**
```
PING c2 (172.18.0.3): 56 data bytes
64 bytes from 172.18.0.3: seq=0 ttl=64 time=0.123 ms
64 bytes from 172.18.0.3: seq=1 ttl=64 time=0.098 ms
```

**It works!** Container `c1` can reach `c2` by name.

**Test the other direction:**
```bash
docker exec -it c2 ping c1
```

Also works! ✅

**Press Ctrl+C to stop the ping.**

---

#### What Happens Internally?

**1. Docker DNS**
- Docker runs an internal DNS server for custom networks
- When `c1` pings `c2`, Docker DNS resolves `c2` to its IP address
- Each container name becomes a hostname automatically

**2. Bridge Network**
- Custom networks use the `bridge` driver by default
- Creates a virtual network inside your computer
- All containers on the same bridge can communicate

**3. Internal IPs**
- Each container gets an internal IP (e.g., 172.18.0.x)
- These IPs are private and only visible inside Docker
- Format: `172.x.x.x` (Docker's internal range)

**Visual:**
```
Your Computer
  └── my-network (bridge)
        ├── c1 (172.18.0.2)  ← Can ping c2 by name
        └── c2 (172.18.0.3)  ← Can ping c1 by name
```

---

#### Verification Commands

**1. List all networks**

```bash
docker network ls
```

Shows all networks on your system.

---

**2. Inspect a network**

```bash
docker network inspect my-network
```

**Output (important fields):**
```json
[
    {
        "Name": "my-network",
        "Driver": "bridge",
        "Scope": "local",
        "IPAM": {
            "Config": [
                {
                    "Subnet": "172.18.0.0/16",
                    "Gateway": "172.18.0.1"
                }
            ]
        },
        "Containers": {
            "abc123...": {
                "Name": "c1",
                "IPv4Address": "172.18.0.2/16"
            },
            "def456...": {
                "Name": "c2",
                "IPv4Address": "172.18.0.3/16"
            }
        }
    }
]
```

**What to look for:**
- **Subnet**: The IP range for this network (172.18.0.0/16)
- **Gateway**: The network gateway (172.18.0.1)
- **Containers**: List of all containers on this network with their IPs

---

**3. Check which containers are on a network**

```bash
docker network inspect my-network -f '{{range .Containers}}{{.Name}} {{.IPv4Address}}{{println}}{{end}}'
```

Output:
```
c1 172.18.0.2/16
c2 172.18.0.3/16
```

---

### 4.2 Docker Volumes (Data Persistence)

#### What are Docker Volumes?

When a container stops, all data inside it is **lost**. Volumes let you save data permanently.

**The Problem:**
- You run a MySQL database container
- Add some data (users, posts, etc.)
- Stop the container
- Start it again → **All data is gone!** 😱

**The Solution:**
- Use **volumes** to save data outside the container
- Data persists even when container is removed
- Essential for databases, file uploads, logs, etc.

---

#### Two Types of Volumes

**1. Named Volumes** (For databases)
- Docker manages where data is stored
- Best for persistent data (databases, important files)
- Data survives container deletion

**2. Bind Mounts** (For development)
- Links a folder on your computer to a folder in the container
- Best for code/files you want to edit live
- Changes appear instantly in the container

---

#### Complete Practical Example

Let's build a simple project with:
- **nginx** serving a website (using bind mount)
- **MySQL** database (using named volume)
- Both containers working together

---

#### Step 1: Create Project Folder

```bash
mkdir docker-volume-demo
cd docker-volume-demo
```

---

#### Step 2: Create a Simple Website

Create `index.html`:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Docker Volume Demo</title>
    <style>
        body { font-family: Arial; text-align: center; padding: 50px; }
        h1 { color: #0066cc; }
    </style>
</head>
<body>
    <h1>Welcome to Docker Volume Demo!</h1>
    <p>This page is served by nginx using a bind mount.</p>
    <p>MySQL database is running with persistent volume storage.</p>
</body>
</html>
```

**Folder structure:**
```
docker-volume-demo/
└── index.html
```

---

#### Step 3: Run MySQL with Named Volume

```bash
docker run -d \
  --name mysql-db \
  -e MYSQL_ROOT_PASSWORD=mypassword \
  -e MYSQL_DATABASE=testdb \
  -v mysql-data:/var/lib/mysql \
  -p 3306:3306 \
  mysql:8.0
```

**Breaking down the command:**
- `-d` = Run in background
- `--name mysql-db` = Container name
- `-e MYSQL_ROOT_PASSWORD=mypassword` = Set root password
- `-e MYSQL_DATABASE=testdb` = Create a database called "testdb"
- `-v mysql-data:/var/lib/mysql` = Mount named volume
  - `mysql-data` = Volume name (Docker manages storage location)
  - `/var/lib/mysql` = **MySQL's default data folder** (where it stores databases)
- `-p 3306:3306` = Expose MySQL port
- `mysql:8.0` = Use MySQL version 8.0

**Why `/var/lib/mysql`?**
- This is where MySQL stores all its data (databases, tables, users)
- By mounting a volume here, all data is saved outside the container
- Like saving your documents folder to a USB drive

---

#### Step 4: Run nginx with Bind Mount

```bash
docker run -d \
  --name web-server \
  -p 8080:80 \
  -v ./:/usr/share/nginx/html \
  nginx
```

**Breaking down the command:**
- `-d` = Run in background
- `--name web-server` = Container name
- `-p 8080:80` = Map port 8080 (your computer) to 80 (container)
- `-v ./:/usr/share/nginx/html` = Mount current folder
  - `./` = Current folder (docker-volume-demo)
  - `/usr/share/nginx/html` = **nginx's default web folder** (where it serves files from)
- `nginx` = Use nginx image

**Why `/usr/share/nginx/html`?**
- This is nginx's default folder for serving web pages
- Any file you put in this folder is served as a web page
- By mounting your local folder here, nginx serves YOUR files

---

#### Step 5: Verify Containers are Running

```bash
docker ps
```

**Expected output:**
```
CONTAINER ID   IMAGE       COMMAND                  PORTS                    NAMES
abc123def456   nginx       "nginx -g 'daemon of…"   0.0.0.0:8080->80/tcp     web-server
xyz789abc123   mysql:8.0   "docker-entrypoint.s…"   0.0.0.0:3306->3306/tcp   mysql-db
```

You should see both containers running! ✅

---

#### Step 6: Test the Website

Open your browser:
```
http://localhost:8080
```

You should see your website! 🎉

**Live editing test:**
1. Edit `index.html` on your computer (change the text)
2. Save the file
3. Refresh your browser → Changes appear instantly!

**This works because of the bind mount** - your local folder is directly linked to nginx.

---

#### Step 7: List Volumes

```bash
docker volume ls
```

**Output:**
```
DRIVER    VOLUME NAME
local     mysql-data
```

You can see the `mysql-data` volume we created! ✅

---

#### Step 8: Inspect the Volume

```bash
docker volume inspect mysql-data
```

**Output:**
```json
[
    {
        "CreatedAt": "2026-03-26T10:30:00Z",
        "Driver": "local",
        "Labels": null,
        "Mountpoint": "/var/lib/docker/volumes/mysql-data/_data",
        "Name": "mysql-data",
        "Options": null,
        "Scope": "local"
    }
]
```

**Important fields:**
- **Name**: `mysql-data` - Your volume name
- **Mountpoint**: Where Docker stores the data on your computer
- **Driver**: `local` - Stored on local disk

---

#### Step 9: Test Data Persistence

Let's prove that MySQL data persists even after stopping the container!

**Step 9.1: Connect to MySQL and create data**

```bash
docker exec -it mysql-db mysql -u root -pmypassword
```

**Inside MySQL, run:**
```sql
USE testdb;
CREATE TABLE users (id INT, name VARCHAR(50));
INSERT INTO users VALUES (1, 'John Doe');
INSERT INTO users VALUES (2, 'Jane Smith');
SELECT * FROM users;
```

**Output:**
```
+------+------------+
| id   | name       |
+------+------------+
|    1 | John Doe   |
|    2 | Jane Smith |
+------+------------+
```

**Exit MySQL:**
```sql
exit
```

---

**Step 9.2: Stop and remove the MySQL container**

```bash
docker stop mysql-db
docker rm mysql-db
```

**The container is gone!** But the volume remains:
```bash
docker volume ls
```

You still see `mysql-data` ✅

---

**Step 9.3: Start a NEW MySQL container with the same volume**

```bash
docker run -d \
  --name mysql-db-new \
  -e MYSQL_ROOT_PASSWORD=mypassword \
  -v mysql-data:/var/lib/mysql \
  -p 3306:3306 \
  mysql:8.0
```

**Note:** Different container name (`mysql-db-new`), but same volume (`mysql-data`)!

---

**Step 9.4: Check if data still exists**

```bash
docker exec -it mysql-db-new mysql -u root -pmypassword -e "SELECT * FROM testdb.users;"
```

**Output:**
```
+------+------------+
| id   | name       |
+------+------------+
|    1 | John Doe   |
|    2 | Jane Smith |
+------+------------+
```

**🎉 The data is still there!** Even though we deleted the original container!

**This proves volumes persist data independently of containers.**

---

#### Understanding Bind Mount vs Named Volume

| Feature | Bind Mount | Named Volume |
|---------|-----------|--------------|
| **Location** | Your folder (./my-folder) | Docker-managed location |
| **Use case** | Development, live editing | Databases, important data |
| **Example** | `-v ./my-website:/usr/share/nginx/html` | `-v mysql-data:/var/lib/mysql` |
| **Visibility** | Files visible on your computer | Hidden in Docker storage |
| **Best for** | Code, HTML, CSS you want to edit | Database data, uploads, logs |
| **Edit files** | ✅ Yes, directly on your computer | ❌ Not recommended |

**Simple rule:**
- **Want to edit files?** → Use bind mount (`-v ./folder:/container/path`)
- **Want to save data?** → Use named volume (`-v volume-name:/container/path`)

---


### 4.3 Environment Variables

#### What Are Environment Variables?

Think of environment variables as **settings** you pass to your container to control how it behaves.

**Simple analogy:**
- Your container is like a phone app
- Environment variables are like the app settings (dark mode on/off, language, etc.)
- You can change these settings without reinstalling the app

**Why do we use them?**
1. **No rebuilding needed** - Change database password without rebuilding image
2. **Keep secrets safe** - Never hardcode passwords in your code
3. **Same image, different configs** - Use one image for testing and production

---

#### How to Set Environment Variables

There are **two main ways**:

**Method 1:** Use `-e` flag (good for 1-3 variables)
**Method 2:** Use `.env` file (good for many variables)

Let's see both with examples!

---

#### Method 1: Using `-e` Flag

**Simple example:**
```bash
docker run -d -e APP_NAME="My Shop" nginx
```

This passes one variable `APP_NAME` with value `My Shop` into the container.

**Multiple variables:**
```bash
docker run -d \
  -e DATABASE_HOST=localhost \
  -e DATABASE_PORT=3306 \
  -e DEBUG=true \
  nginx
```

Each `-e` adds one variable. The app inside the container can read these values.

---

#### Method 2: Using `.env` File

When you have many variables, typing them all is annoying. Use a file instead!

**Step 1: Create a file named `.env`**
```env
DATABASE_HOST=localhost
DATABASE_PORT=3306
API_KEY=secret123
DEBUG=true
```

**Step 2: Use the file when running**
```bash
docker run -d --env-file .env nginx
```

**That's it!** All 4 variables are now inside the container.

**⚠️ Important:** Add `.env` to `.gitignore` so you don't accidentally commit passwords to GitHub!

---

#### Real Example: MySQL Database

Let's set up a MySQL database with environment variables. This is very common in real projects!

**What MySQL needs:**
- `MYSQL_ROOT_PASSWORD` - Admin password (required!)
- `MYSQL_DATABASE` - Name of database to create
- `MYSQL_USER` - Regular user to create
- `MYSQL_PASSWORD` - Password for that user

---

**Example 1: Using `-e` flags**

```bash
docker run -d \
  --name my-database \
  -e MYSQL_ROOT_PASSWORD=admin123 \
  -e MYSQL_DATABASE=shop_db \
  -e MYSQL_USER=john \
  -e MYSQL_PASSWORD=john123 \
  -p 3306:3306 \
  mysql
```

**What happens inside MySQL:**
1. Root password set to `admin123` ✅
2. Database `shop_db` created ✅
3. User `john` created with password `john123` ✅
4. User `john` can access `shop_db` ✅

**Test it works:**
```bash
# Connect as john
docker exec -it my-database mysql -u john -pjohn123 shop_db
```

You're now inside MySQL! Type `exit` to leave.

---

**Example 2: Using `.env` file (cleaner!)**

**Create `.env` file:**
```env
MYSQL_ROOT_PASSWORD=admin123
MYSQL_DATABASE=shop_db
MYSQL_USER=john
MYSQL_PASSWORD=john123
```

**Run MySQL:**
```bash
docker run -d \
  --name my-database \
  --env-file .env \
  -p 3306:3306 \
  mysql
```

**Same result, but cleaner!** Perfect for projects with many settings.

---

#### Setting Defaults in Dockerfile

You can set **default values** in your Dockerfile. Users can override them later if needed.

**Example Dockerfile:**
```dockerfile
FROM node:18

# Set default environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV APP_NAME="My App"

COPY . /app
WORKDIR /app

CMD ["node", "server.js"]
```

**Build the image:**
```bash
docker build -t my-node-app .
```

**Run with defaults:**
```bash
docker run -d my-node-app
# Uses: NODE_ENV=production, PORT=3000
```

**Run with overrides:**
```bash
docker run -d \
  -e NODE_ENV=development \
  -e PORT=8080 \
  my-node-app
# Now uses: NODE_ENV=development, PORT=8080
```

**The key idea:**
- Dockerfile = default settings
- `-e` flag = override when you run

---
### 4.4 Docker Compose (IMPORTANT)

#### What is Docker Compose?

Docker Compose is a tool for running **multiple containers** together. Instead of running many `docker run` commands, you write one configuration file.

**Why use it:**
- Manage multiple containers easily
- One command to start everything
- Easy to share your full application setup

#### Simple docker-compose.yml Example

Let's create a web app with nginx and a database:

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  # Web server
  web:
    image: nginx:1.25.3
    container_name: my-nginx
    ports:
      - "8080:80"
    volumes:
      - ./index.html:/usr/share/nginx/html/index.html
    networks:
      - app-network

  # Database
  database:
    image: mysql:8.0
    container_name: my-mysql
    environment:
      MYSQL_ROOT_PASSWORD: rootpass123
      MYSQL_DATABASE: myapp_db
      MYSQL_USER: appuser
      MYSQL_PASSWORD: apppass123
    volumes:
      - mysql-data:/var/lib/mysql
    networks:
      - app-network

# Define volumes
volumes:
  mysql-data:

# Define networks
networks:
  app-network:
```

#### What Each Part Does:

- **version: '3.8'** - Docker Compose file format version
- **services:** - List of containers to run
- **web:** - Name of our service
- **image: nginx:1.25.3** - Use specific nginx version
- **container_name:** - Custom name for the container
- **ports:** - Map port 8080 on your computer to port 80 in container
- **volumes:** - Share files between your computer and container
- **environment:** - Set environment variables for the database
- **networks:** - Connect services to the same network (so web can talk to database)
- **volumes: mysql-data:** - Define named volume for database persistence

---

#### Docker Compose Commands

**Start all services:**
```bash
docker-compose up
```

**Start in background:**
```bash
docker-compose up -d
```

**Stop and remove all services:**
```bash
docker-compose down
```

**View running services:**
```bash
docker-compose ps
```

---

## Quick Reference

### Common Workflow

1. **Pull an image:** `docker pull nginx:1.25.3`
2. **Run a container:** `docker run -d -p 8080:80 --name web nginx`
3. **Check if running:** `docker ps`
4. **View logs:** `docker logs web`
5. **Stop container:** `docker stop web`
6. **Start container:** `docker start web`
7. **Remove container:** `docker rm web`

### Run with All Options

```bash
docker run -d \
  --name my-app \
  -p 8080:80 \
  -e API_KEY=secret \
  -v ./data:/app/data \
  --network my-network \
  nginx:1.25.3
```

### Build Your Own Image

1. Create `Dockerfile`
2. Write your instructions
3. Build: `docker build -t my-app:1.0 .`
4. Run: `docker run -d -p 8080:80 --name app my-app:1.0`

### Use Docker Compose

1. Create `docker-compose.yml`
2. Define your services (with ports, volumes, environment)
3. Run: `docker-compose up -d`
4. View logs: `docker-compose logs -f`
5. Stop: `docker-compose down`

### Docker Volumes

```bash
# Create volume
docker volume create my-data

# Use volume
docker run -v my-data:/app/data nginx

# List volumes
docker volume ls

# Remove volume
docker volume rm my-data
```

### Useful Commands

| Command | Purpose |
|---------|---------|
| `docker ps` | List running containers |
| `docker ps -a` | List all containers |
| `docker images` | List images |
| `docker logs <container>` | View container logs |
| `docker exec -it <container> bash` | Enter container |
| `docker stop $(docker ps -q)` | Stop all containers |
| `docker system prune -a` | Clean up everything |

---

## Practice Exercise

### Exercise 1: Basic Container

Try this step-by-step:

1. Create a folder called `my-docker-app`
2. Create an `index.html` file with some HTML
3. Create a `Dockerfile` using the nginx example above
4. Build your image: `docker build -t my-first-app:1.0 .`
5. Run it: `docker run -d -p 8080:80 --name first-app my-first-app:1.0`
6. Open `http://localhost:8080` in your browser
7. Check logs: `docker logs first-app`
8. Success! You've built and run your own Docker container!

### Exercise 2: Using Volumes

Try editing files without rebuilding:

1. Create a folder: `mkdir my-site`
2. Create `my-site/index.html`:
   ```html
   <h1>Version 1</h1>
   ```
3. Run nginx with volume:
   ```bash
   docker run -d -p 8080:80 -v ./my-site:/usr/share/nginx/html --name site nginx
   ```
4. Visit `http://localhost:8080`
5. Edit `my-site/index.html` to say "Version 2"
6. Refresh browser - see instant changes!

### Exercise 3: Docker Compose

Create a full application:

1. Create `docker-compose.yml` with the example above
2. Create `index.html` in the same folder
3. Run: `docker-compose up -d`
4. Check: `docker-compose ps`
5. View logs: `docker-compose logs web`
6. Stop: `docker-compose down`

---

## Tips for Beginners

- **Start simple:** Don't try to learn everything at once
- **Use official images:** They're well-tested and documented
- **Read error messages:** Docker's errors are usually helpful
- **Clean up:** Remove old containers and images to save space
- **Use Docker Hub:** Find thousands of pre-built images at hub.docker.com

---

## Troubleshooting

**Container won't start?**
- Check logs: `docker logs <container-name>`
- Check if image exists: `docker images`
- Try running without `-d` to see errors in real-time

**Port already in use?**
- Use a different port: `-p 8081:80` instead of `-p 8080:80`
- Find what's using port: `netstat -ano | grep 8080` (Linux/Mac) or `netstat -ano | findstr 8080` (Windows)
- Stop other container using that port

**Can't connect to container?**
- Make sure it's running: `docker ps`
- Check port mapping is correct
- Try `localhost` or `127.0.0.1` in browser
- Check container logs for errors

**Permission denied errors?**
- On Linux: May need `sudo` or add user to docker group
- On Windows: Make sure Docker Desktop is running
- Check file permissions for volumes

**"No space left on device"?**
- Clean up: `docker system prune -a`
- Remove unused volumes: `docker volume prune`
- Remove unused images: `docker image prune -a`

**Container keeps restarting?**
- Check logs: `docker logs <container-name>`
- Application inside might be crashing
- Check environment variables are correct

**Can't find command inside container?**
```bash
# Some containers use sh instead of bash
docker exec -it <container> sh

# Or check what shell is available
docker exec -it <container> ls /bin
```

**Docker Compose not working?**
- Check YAML syntax (indentation matters!)
- Make sure file is named `docker-compose.yml`
- Try: `docker-compose up` without `-d` to see errors
- Check if ports are available

**Volume data not persisting?**
- Use named volumes, not anonymous ones
- Check volume is properly defined in docker-compose.yml
- List volumes: `docker volume ls`
- Inspect volume: `docker volume inspect <volume-name>`
