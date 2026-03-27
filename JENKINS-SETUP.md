# Jenkins CI/CD Setup Guide

Complete guide to set up automated deployment for Docker project using Jenkins.

---

## 📋 Prerequisites

- Linux server with Jenkins installed
- Docker and Docker Compose installed on the same server
- GitHub repository: https://github.com/Shwetank0196/ci-cd-docker-jenkins.git
- Jenkins accessible at: `http://your-server-ip:8080`

---

## ⚠️ Pre-Setup Fix (IMPORTANT)

**Before starting Jenkins setup, fix these common issues:**

### 🔧 Fix 1: Install Git (Required for Jenkins)

**If you see error like:**
```
Cannot run program "git": No such file or directory
```

**Run:**
```bash
# Install Git
sudo dnf install git -y

# Verify installation
git --version

# Check path
which git
```

**👉 Expected path:** `/usr/bin/git`

**(Optional - if Jenkins still can't detect Git):**

1. Go to Jenkins → **Manage Jenkins** → **Tools**
2. Scroll to **Git** section
3. Add Git manually:
   - **Name**: `Default`
   - **Path**: `/usr/bin/git`
4. **Save**

---

### 🕒 Fix 2: Fix Date/Time (SSL Certificate Error)

**If you see error like:**
```
certificate is not yet valid
```

**👉 This means your server time is incorrect.**

**Fix it using NTP (chrony):**
```bash
# Install chrony
sudo dnf install chrony -y

# Enable and start service
sudo systemctl enable chronyd
sudo systemctl start chronyd

# Set timezone (example: India)
sudo timedatectl set-timezone Asia/Kolkata

# Force time sync
sudo chronyc makestep

# Verify
timedatectl status
date
```

**👉 Expected output:**
```
System clock synchronized: yes
```

**Common Timezones:**
- `Asia/Kolkata` (India)
- `America/New_York` (US East)
- `Europe/London` (UK)
- `Asia/Dubai` (UAE)
- `UTC` (Universal)

**After fixing, restart Jenkins:**
```bash
sudo systemctl restart jenkins
```

---

## 🔧 Step 1: Give Jenkins Permission to Use Docker

Run these commands on your **Linux server** (via SSH or terminal):

```bash
# Add jenkins user to docker group
sudo usermod -aG docker jenkins

# Restart Jenkins service
sudo systemctl restart jenkins

# Verify the permission (should show no errors)
sudo -u jenkins docker ps
```

**What this does:**
- Grants Jenkins user permission to access Docker
- Restarts Jenkins to apply changes
- Verifies Jenkins can run Docker commands

**Wait 30-60 seconds** for Jenkins to fully restart before proceeding.

---

## 🚀 Step 2: Create Jenkins Pipeline Job

### 2.1 Create New Pipeline

1. Open Jenkins in browser: `http://your-server-ip:8080`
2. Click **"New Item"** (top-left corner)
3. Enter job name: `Docker-Deploy`
4. Select **"Pipeline"** project type
5. Click **"OK"**

### 2.2 Configure Pipeline

In the job configuration page:

**General Section:**
- ✅ Check **"GitHub project"** (optional)
  - Project URL: `https://github.com/Shwetank0196/ci-cd-docker-jenkins/`

**Pipeline Section:**
- **Definition**: Select `Pipeline script from SCM`
- **SCM**: Select `Git`
- **Repository URL**: `https://github.com/Shwetank0196/ci-cd-docker-jenkins.git`
- **Credentials**: Leave as `- none -` (for public repo)
- **Branch Specifier**: `*/main`
- **Script Path**: `Jenkinsfile`

**Save** the configuration.

---

## ✅ Step 3: Run Your First Build

1. Click **"Build Now"** (left sidebar)
2. Watch the build progress in **"Build History"**
3. Click on the build number (e.g., `#1`)
4. Click **"Console Output"** to see detailed logs

### Expected Result:
```
✅ Deployment Successful!
Finished: SUCCESS
```

Your application will be running at:
- **Nginx (Main Entry)**: `http://your-server-ip:8081`
- **Frontend Direct**: `http://your-server-ip:8082`
- **Backend API**: `http://your-server-ip:3000`

---

## 🔄 Optional: Auto-Deploy on Git Push (Webhook)

### On Jenkins:

1. Go to job → **Configure**
2. Under **"Build Triggers"**:
   - ✅ Check **"GitHub hook trigger for GITScm polling"**
3. **Save**

### On GitHub:

1. Go to your repository: https://github.com/Shwetank0196/ci-cd-docker-jenkins
2. Click **Settings** → **Webhooks** → **Add webhook**
3. **Payload URL**: `http://your-jenkins-ip:8080/github-webhook/`
4. **Content type**: `application/json`
5. **Which events**: Select `Just the push event`
6. **Active**: ✅ Checked
7. Click **Add webhook**

Now every `git push` will automatically trigger Jenkins to build and deploy! 🎉

---

## 📝 What the Pipeline Does

The Jenkinsfile automates these steps:

1. **Clone Repository**: Pulls latest code from GitHub
2. **Stop Old Containers**: Stops running containers gracefully
3. **Deploy with Docker Compose**: Rebuilds images and starts containers
4. **Verify Deployment**: Shows running containers

---

## 🐛 Troubleshooting

### Issue: "Cannot run program 'git': No such file or directory"
**Solution**: Git is not installed. Install it:
```bash
sudo dnf install git -y
git --version
sudo systemctl restart jenkins
```

### Issue: "SSL certificate problem: certificate is not yet valid"
**Solution**: Server time is incorrect. Fix with chrony:
```bash
sudo dnf install chrony -y
sudo systemctl enable chronyd --now
sudo timedatectl set-timezone Asia/Kolkata
sudo chronyc makestep
date
sudo systemctl restart jenkins
```

### Issue: "permission denied while trying to connect to docker"
**Solution**: Run the permission commands from Step 1 again.

### Issue: "docker-compose: command not found"
**Solution**: Use `docker compose` (with space) instead of `docker-compose`. Already fixed in Jenkinsfile.

### Issue: "No such file or directory" errors
**Solution**: Ensure all files (backend, frontend, docker-compose.yml) are in the repository root.

### Issue: Build stays running forever
**Solution**: Check if containers are stuck. Run on server:
```bash
docker ps -a
docker compose -f /var/lib/jenkins/workspace/Docker-Deploy/docker-compose.yml down
```

---

## 🎯 Quick Commands Reference

### On Linux Server:

```bash
# Check if Jenkins has docker permission
sudo -u jenkins docker ps

# Restart Jenkins
sudo systemctl restart jenkins

# Check Jenkins status
sudo systemctl status jenkins

# View Jenkins logs
sudo journalctl -u jenkins -f

# Manually stop containers
cd /var/lib/jenkins/workspace/Docker-Deploy
sudo docker compose down

# Manually start containers
sudo docker compose up -d
```

---

## 📂 Project Structure

```
ci-cd-docker-jenkins/
├── Jenkinsfile              ← Jenkins pipeline script
├── JENKINS-SETUP.md         ← This guide
├── docker-compose.yml       ← Docker compose configuration
├── backend/                 ← Backend API (Node.js)
├── frontend/                ← Frontend application
├── mysql/                   ← MySQL initialization scripts
├── nginx/                   ← Nginx configuration
└── docs/                    ← Documentation files
```

---

## ✨ You're All Set!

Your CI/CD pipeline is ready. Every time you:
1. Make code changes
2. Push to GitHub
3. Jenkins automatically deploys

**No more manual `docker compose up`!** 🚀
