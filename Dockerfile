FROM docker.io/node:25-alpine AS builder
WORKDIR /build
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM docker.io/nginx:1.29-alpine
COPY --from=builder /build/dist /usr/share/nginx/html
EXPOSE 80
