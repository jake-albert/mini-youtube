# Stage 1: Build app
FROM node:18.17 as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Prepare production
FROM node:18.17
# Note that the Node image is built on a Linux image
RUN apt-get update && apt-get install -y ffmpeg
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production

COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD [ "npm", "run", "serve" ]
