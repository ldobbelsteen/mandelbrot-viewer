FROM node:alpine AS builder
WORKDIR /build
COPY . .
RUN npm install
RUN npm run build

FROM caddy:alpine
COPY --from=builder /build/dist /usr/share/caddy
EXPOSE 80
