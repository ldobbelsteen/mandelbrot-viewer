FROM docker.io/node:20-alpine AS builder
WORKDIR /build
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM docker.io/nginx:1.28-alpine
COPY --from=builder /build/dist /usr/share/nginx/html
EXPOSE 80
