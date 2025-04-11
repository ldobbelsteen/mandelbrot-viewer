FROM docker.io/node:lts-alpine AS builder
WORKDIR /build
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM docker.io/nginx:stable-alpine
COPY --from=builder /build/dist /usr/share/nginx/html
EXPOSE 80
