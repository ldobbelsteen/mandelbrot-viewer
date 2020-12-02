FROM node:alpine AS builder
RUN apk add --no-cache python make g++
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

FROM caddy
COPY --from=builder /app/dist /usr/share/caddy
EXPOSE 80
