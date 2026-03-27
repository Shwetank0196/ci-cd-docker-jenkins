# Troubleshooting Guide

This guide helps you solve common Docker problems you might encounter. Each issue includes symptoms, causes, and solutions.

## General Debugging Strategy

**When something goes wrong:**

1. **Check if containers are running**
   ```bash
   docker-compose ps
   docker ps -a
   ```

2. **Check the logs**
   ```bash
   docker-compose logs
   docker-compose logs <service-name>
   docker logs <container-name>
   ```

3. **Inspect the container**
   ```bash
   docker inspect <container-name>
   ```

4. **Enter the container**
   ```bash
   docker exec -it <container-name> sh
   ```

5. **Rebuild if needed**
   ```bash
   docker-compose up --build
   ```

---

## Docker Installation Issues

### Issue: "Docker daemon is not running"

**Symptoms:**
```
Cannot connect to the Docker daemon at unix:///var/run/docker.sock. Is the docker daemon running?
```

**Solution:**

**Windows/Mac:**
1. Open Docker Desktop
2. Wait for it to fully start (whale icon in system tray)
3. Try command again

**Linux:**
```bash
sudo systemctl start docker
sudo systemctl enable docker
```

---

### Issue: "Permission denied" (Linux)

**Symptoms:**
```
Got permission denied while trying to connect to the Docker daemon socket
```

**Solution:**
```bash
# Add your user to docker group
sudo usermod -aG docker $USER

# Log out and log back in, or run:
newgrp docker

# Test
docker ps
```

---

## Docker Compose Issues

### Issue: "service 'X' doesn't have any configuration"

**Symptoms:**
```
ERROR: service 'backend' doesn't have any configuration options
```

**Cause:** YAML indentation error

**Solution:**
Check your docker-compose.yml indentation (2 spaces, not tabs):

```yaml
# ❌ Wrong indentation
services:
backend:
  build: ./backend

# ✅ Correct indentation
services:
  backend:
    build: ./backend
```

---

### Issue: "Unexpected character" in docker-compose.yml

**Cause:** YAML syntax error (often tabs or special characters)

**Solution:**
1. Check for tabs (use spaces only)
2. Check for special characters in strings
3. Use a YAML validator: https://www.yamllint.com/

---

### Issue: "Build failed" or "Cannot locate specified Dockerfile"

**Symptoms:**
```
ERROR: Cannot locate specified Dockerfile: Dockerfile
```

**Cause:** Dockerfile not in expected location

**Solution:**
Check paths in docker-compose.yml:

```yaml
services:
  backend:
    build: ./backend  # Looks for ./backend/Dockerfile
```

Verify file exists:
```bash
ls backend/Dockerfile
```

---

## Port Issues

### Issue: "Port is already allocated"

**Symptoms:**
```
Bind for 0.0.0.0:3000 failed: port is already allocated
```

**Cause:** Another process is using the port

**Solution 1: Find and stop the process**

**Windows:**
```bash
# Find what's using port 3000
netstat -ano | findstr :3000

# Output shows PID (last column)
# Kill process by PID
taskkill /PID <pid> /F
```

**Mac/Linux:**
```bash
# Find what's using port 3000
lsof -i :3000

# Kill process by PID
kill -9 <pid>
```

**Solution 2: Use a different port**
```yaml
services:
  backend:
    ports:
      - "3001:3000"  # Use 3001 instead of 3000
```

---

### Issue: "Connection refused" when accessing container

**Symptoms:**
- Can't access `localhost:3000`
- `curl: (7) Failed to connect`

**Cause:** Port not mapped or service not running

**Solution:**

**Check 1: Is port mapped?**
```bash
docker ps
```
Look for `PORTS` column: `0.0.0.0:3000->3000/tcp`

**Check 2: Is service running?**
```bash
docker-compose logs backend
```

**Check 3: Is application listening on correct port?**
```bash
# Enter container
docker exec -it student-api sh

# Check if app is listening
netstat -ln | grep 3000

# Or try curl from inside
curl localhost:3000
```

---

## Network Issues

### Issue: Container can't reach another container

**Symptoms:**
```
ECONNREFUSED: Connection refused
fetch failed: connect ECONNREFUSED
```

**Cause:** Containers not on same network or wrong hostname

**Solution:**

**Check 1: Same network?**
```bash
docker network inspect student-network
```

**Check 2: Using service name?**
```javascript
// ✅ Correct (use service name)
fetch('http://backend:3000')

// ❌ Wrong (localhost won't work)
fetch('http://localhost:3000')
```

**Check 3: Is target container running?**
```bash
docker-compose ps
```

---

### Issue: "Could not resolve host: backend"

**Symptoms:**
```
Error: getaddrinfo ENOTFOUND backend
```

**Cause:** Container not on network or service name doesn't exist

**Solution:**

**Check service name in docker-compose.yml:**
```yaml
services:
  backend:  # ← This is the service name
    ...
```

**Test DNS resolution:**
```bash
# Enter frontend container
docker exec -it student-frontend sh

# Test DNS
nslookup backend
ping backend
```

---

## Build Issues

### Issue: "npm install" fails during build

**Symptoms:**
```
ERROR: npm ERR! code ENOTFOUND
npm ERR! network request failed
```

**Cause:** Network issues or npm registry down

**Solution:**

**Try building with no cache:**
```bash
docker-compose build --no-cache
```

**Check internet connection:**
```bash
docker run --rm node:18-alpine npm config get registry
```

**Try different npm registry:**
```dockerfile
# In Dockerfile, before RUN npm install
RUN npm config set registry https://registry.npmmirror.com
```

---

### Issue: "COPY failed" during build

**Symptoms:**
```
ERROR: COPY failed: stat /var/lib/docker/.../file.txt: no such file or directory
```

**Cause:** File doesn't exist or excluded by .dockerignore

**Solution:**

**Check file exists:**
```bash
ls backend/package.json
```

**Check .dockerignore:**
```bash
cat backend/.dockerignore
```

Remove relevant lines if file was accidentally ignored.

---

### Issue: Build is extremely slow

**Cause:** Large build context or no layer caching

**Solution:**

**Check build context size:**
```bash
cd backend
du -sh .
```

**Use .dockerignore:**
```
node_modules
.git
*.log
data/
```

**Optimize Dockerfile (copy package.json first):**
```dockerfile
# ✅ Good (cached)
COPY package*.json ./
RUN npm install
COPY . .

# ❌ Bad (no caching)
COPY . .
RUN npm install
```

---

## Container Issues

### Issue: Container exits immediately

**Symptoms:**
```bash
docker ps -a
# Status: Exited (0) few seconds ago
```

**Solution:**

**Check logs:**
```bash
docker logs <container-name>
```

**Common causes:**
1. **Application crashed** - check logs for errors
2. **No foreground process** - CMD should run a long-running process
3. **Health check failed** - check health check configuration

---

### Issue: Container is running but application not working

**Solution:**

**Check application logs:**
```bash
docker logs -f student-api
```

**Enter container and debug:**
```bash
docker exec -it student-api sh

# Check if process is running
ps aux

# Check if port is listening
netstat -ln

# Test application
curl localhost:3000/health
```

---

### Issue: "Cannot remove container" or "Device or resource busy"

**Symptoms:**
```
Error response from daemon: cannot remove container: Device or resource busy
```

**Solution:**

**Force remove:**
```bash
docker rm -f <container-name>
```

**If that fails, restart Docker:**
- Windows/Mac: Restart Docker Desktop
- Linux: `sudo systemctl restart docker`

---

## Volume Issues

### Issue: Data not persisting

**Symptoms:**
- Add data, stop containers, start again
- Data is gone

**Solution:**

**Check volume is defined:**
```yaml
services:
  backend:
    volumes:
      - ./backend/data:/app/data  # ← Volume defined?
```

**Check directory exists:**
```bash
ls backend/data
```

**Check logs for write errors:**
```bash
docker logs student-api
```

---

### Issue: Permission denied writing to volume (Linux)

**Symptoms:**
```
Error: EACCES: permission denied, open '/app/data/students.db'
```

**Solution:**

**Fix permissions:**
```bash
sudo chown -R $USER:$USER ./backend/data
chmod -R 755 ./backend/data
```

**Or run container as current user:**
```yaml
services:
  backend:
    user: "${UID}:${GID}"
```

---

### Issue: Volume is empty or showing old data

**Solution:**

**Remove volume and restart:**
```bash
# Stop containers and remove volumes
docker-compose down -v

# Start fresh
docker-compose up -d
```

**⚠️ Warning:** This deletes all data in volumes!

---

## Application-Specific Issues

### Issue: API returns 404 for all routes

**Cause:** Nginx routing misconfigured

**Solution:**

**Check nginx.conf:**
```nginx
location /api/ {
    proxy_pass http://backend/;  # ← Note the trailing slash
}
```

**Test backend directly:**
```bash
# Backend should be accessible on its port
curl http://localhost:3000/students
```

**Check nginx logs:**
```bash
docker logs student-nginx
```

---

### Issue: CORS errors in browser

**Symptoms:**
```
Access to fetch at 'http://localhost:3000/students' from origin 'http://localhost:8080'
has been blocked by CORS policy
```

**Cause:** CORS not enabled in backend

**Solution:**

**backend/server.js should have:**
```javascript
const cors = require('cors');
app.use(cors());
```

---

### Issue: "Cannot find module" error

**Symptoms:**
```
Error: Cannot find module 'express'
```

**Cause:** Dependencies not installed

**Solution:**

**Rebuild with no cache:**
```bash
docker-compose build --no-cache backend
docker-compose up -d
```

**Check package.json exists:**
```bash
cat backend/package.json
```

---

## Performance Issues

### Issue: Container is very slow

**Cause:** File sharing performance (Windows/Mac)

**Solution:**

**Use named volumes instead of bind mounts:**
```yaml
# ❌ Slow (bind mount)
volumes:
  - ./backend:/app

# ✅ Faster (named volume)
volumes:
  - backend-code:/app
```

**Exclude node_modules from bind mount:**
```yaml
volumes:
  - ./backend:/app
  - /app/node_modules  # Don't sync node_modules
```

---

### Issue: docker-compose up takes forever

**Cause:** Building large images

**Solution:**

**Build once, then up:**
```bash
docker-compose build
docker-compose up -d
```

**Use .dockerignore:**
```
node_modules
.git
*.log
```

---

## Database Issues

### Issue: MySQL connection failed

**Cause:** Backend can't connect to MySQL database

**Solution:**

**Check MySQL container status:**
```bash
docker-compose ps mysql-db
```

**Check if MySQL is ready:**
```bash
docker-compose logs mysql-db
# Look for: "MySQL init process done. Ready for start up."
```

**Test MySQL connection:**
```bash
# Access MySQL container
docker-compose exec mysql-db mysql -u student_user -p student_management
# Password: student_password
```

### Issue: MySQL data lost after restart

**Cause:** Named volume not properly configured

**Solution:**

**Check volume exists:**
```bash
docker volume ls | grep mysql
```

**Verify volume configuration in docker-compose.yml:**
```yaml
volumes:
  mysql-data:
    driver: local
```

### Issue: Backend shows "Connection timeout"

**Cause:** Backend starts before MySQL is ready

**Solution:**

**Use healthcheck dependency in docker-compose.yml:**
```yaml
depends_on:
  mysql-db:
    condition: service_healthy
```

---

## Docker Desktop Issues

### Issue: Docker Desktop won't start

**Solution:**

**Windows:**
1. Restart computer
2. Run Docker Desktop as administrator
3. Reset Docker to factory defaults (Settings → Troubleshoot)

**Mac:**
1. Quit Docker completely
2. Delete `~/Library/Group Containers/group.com.docker`
3. Restart Docker

---

## Common Error Messages

### "no configuration file provided"

**Solution:**
Run commands from directory containing docker-compose.yml:
```bash
cd /path/to/docker-guide-
docker-compose up
```

---

### "invalid reference format"

**Cause:** Malformed image name or tag

**Solution:**
Check image names:
```yaml
# ✅ Correct
image: nginx:alpine

# ❌ Wrong
image: nginx:alpine:latest
```

---

### "pull access denied"

**Cause:** Image doesn't exist or typo in name

**Solution:**
Check image name:
```yaml
# ✅ Correct
image: nginx:alpine

# ❌ Wrong (typo)
image: nignx:alpine
```

---

## Debugging Checklist

When something isn't working:

- [ ] **Check container status:** `docker-compose ps`
- [ ] **Check logs:** `docker-compose logs -f`
- [ ] **Verify network:** `docker network inspect student-network`
- [ ] **Check port mapping:** `docker ps` (look at PORTS column)
- [ ] **Test from inside container:** `docker exec -it <container> sh`
- [ ] **Rebuild images:** `docker-compose up --build`
- [ ] **Check file permissions:** `ls -la <directory>`
- [ ] **Verify files exist:** `ls <path>`
- [ ] **Check YAML syntax:** Use YAML validator
- [ ] **Read error messages carefully:** Often tells you exactly what's wrong

---

## Getting Help

### Read the logs first!

```bash
# All logs
docker-compose logs

# Last 100 lines
docker-compose logs --tail 100

# Follow logs
docker-compose logs -f

# Specific service
docker-compose logs backend
```

Logs usually tell you exactly what went wrong.

---

### Check Docker status

```bash
# Docker version
docker --version

# Docker info
docker info

# System resource usage
docker system df
```

---

### Clean up when stuck

```bash
# Stop everything
docker-compose down

# Remove all containers
docker container prune

# Remove all images
docker image prune -a

# Remove volumes (⚠️ deletes data!)
docker volume prune

# Remove everything (⚠️ nuclear option!)
docker system prune -a --volumes
```

---

### Still stuck?

1. **Read the error message slowly** - it often tells you exactly what's wrong
2. **Google the error** - others have likely had the same issue
3. **Check official docs:** https://docs.docker.com/
4. **Ask for help:** Include logs, docker-compose.yml, and error messages

---

## Prevention Tips

### 1. Always check logs when something fails

```bash
docker-compose logs -f
```

### 2. Use meaningful names

```yaml
container_name: student-api  # ✅ Clear
# vs
# random-name-123           # ❌ Confusing
```

### 3. Document your setup

Comment your docker-compose.yml:
```yaml
services:
  backend:
    # API server - handles student CRUD operations
    build: ./backend
```

### 4. Test incrementally

Don't build everything at once:
```bash
# Test backend first
docker-compose up backend

# Then add frontend
docker-compose up backend frontend

# Finally add nginx
docker-compose up
```

### 5. Keep images up to date

```bash
# Pull latest base images
docker-compose pull

# Rebuild
docker-compose build

# Restart
docker-compose up -d
```

---

## Summary

**Most common issues:**
1. **Port conflicts** → Use different port or stop conflicting process
2. **Network issues** → Use service names, not localhost
3. **Build failures** → Check .dockerignore, use `--no-cache`
4. **Permission errors** → Fix folder permissions (Linux)
5. **Container exits** → Check logs for application errors

**First steps for any issue:**
1. Check logs: `docker-compose logs`
2. Check status: `docker-compose ps`
3. Rebuild: `docker-compose up --build`
4. Start fresh: `docker-compose down && docker-compose up -d`

**Remember:** Logs are your best friend! Always check them first.

---

## Next Steps

- [01-docker-basics.md](./01-docker-basics.md) - Refresh Docker fundamentals
- [02-docker-commands.md](./02-docker-commands.md) - Command reference
- [05-networking-guide.md](./05-networking-guide.md) - Network troubleshooting
- [06-volumes-guide.md](./06-volumes-guide.md) - Volume issues
