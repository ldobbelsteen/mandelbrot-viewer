FROM node:alpine AS builder
WORKDIR /build
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

FROM caddy:alpine
COPY --from=builder /build/dist /usr/share/caddy
EXPOSE 80
