FROM node:18-alpine

WORKDIR /app

# Copy package.json files first for caching
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies for client and server
RUN npm install --prefix client
RUN npm install --prefix server
RUN npm install -g serve

# 🔥 Copy the entire client folder (including public/index.html) and server
COPY client /app/client
COPY server /app/server

# Build the React frontend
RUN npm run build --prefix client

EXPOSE 3000
EXPOSE 5001

# Start both backend and frontend
CMD ["npx", "concurrently", "npm run dev --prefix server", "serve -s client/build"]
