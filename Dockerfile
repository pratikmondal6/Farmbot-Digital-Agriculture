# Dockerfile

FROM node:18-alpine

WORKDIR /app

COPY . .

RUN npm install
RUN npm install -g serve
RUN npm install --prefix client
RUN npm install --prefix server

RUN npm run build --prefix client

EXPOSE 3000
EXPOSE 5000

CMD ["npx", "concurrently", "npm run dev --prefix server", "serve -s client/build"]