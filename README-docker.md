# 🌿 EasyFarm

EasyFarm is a simple full-stack farming management application with a Node.js backend and React frontend, packaged with Docker.

## 🚀 Usage (Docker)
1. **Install Docker Desktop**: https://www.docker.com/products/docker-desktop
2. **Clone the repository**:
    ```bash
    git clone https://df-git.informatik.uni-kl.de/teaching/df-project/ss25/team-uni.git
    cd team-uni
    ```
3. **Build the Docker image**:
    ```bash
     docker build --no-cache -t easy-farm .
    ```
4. **Run the Docker container**:
    ```bash
    docker run -p 3000:3000 -p 5000:5000 easy-farm
    ```
    - React frontend: [http://localhost:3000](http://localhost:3000)
    - Node.js backend: [http://localhost:5000](http://localhost:5000)

### Build and run with docker-compose (Alternative method)

  ```bash
    docker-compose down; if ($?) { docker-compose build --no-cache } if ($?) { docker-compose up }
  ```

**Stop the container** (if needed):
  ```bash
    docker compose down
  ```
## 🏗️ Ports
- **3000**: React frontend (served with `serve`)
- **5000**: Node.js backend

## 📁 Project Structure
/client – React frontend  
/server – Node.js backend  
Dockerfile – Docker build configuration

**Stop and remove any container using port 3000 or 5000  (Optional, only needed if there is conflicts & you want to clean up existing ports)**
```bash
```powershell
docker ps -q --filter "publish=3000" | ForEach-Object { docker stop $_; docker rm $_ }; `
docker ps -q --filter "publish=5000" | ForEach-Object { docker stop $_; docker rm $_ }; `


