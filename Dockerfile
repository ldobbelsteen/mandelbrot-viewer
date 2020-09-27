FROM node:alpine AS builder
WORKDIR /build
COPY package.json .
RUN npm install --production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /build/www /usr/share/nginx/html
EXPOSE 80
