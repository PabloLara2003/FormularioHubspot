# frontend/Dockerfile
# stage 1: build
FROM node:18-alpine AS build

WORKDIR /app
ENV CI=true

COPY package.json package-lock.json* ./
RUN npm ci --silent

COPY . .
RUN npm run build

# stage 2: nginx to serve static files and proxy /api
FROM nginx:stable-alpine

# copiar config nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# copiar archivos estáticos del build
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
