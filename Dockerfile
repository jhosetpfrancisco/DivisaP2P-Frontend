# ---------- build ----------
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
# npm install (no ci): el lockfile se generó en Windows y le faltan deps
# nativas opcionales de linux-musl; install las resuelve para esta plataforma.
RUN npm install --no-audit --no-fund
COPY . .
# VITE_API_URL se inyecta en build (Railway build var). Si no se pasa,
# se usa el valor de .env.production. import.meta.env.VITE_API_URL se "hornea"
# en el bundle, por eso debe existir en este paso.
ARG VITE_API_URL
RUN if [ -n "$VITE_API_URL" ]; then echo "VITE_API_URL=$VITE_API_URL" > .env.production.local; fi \
    && npm run build

# ---------- serve ----------
FROM nginx:alpine
# Railway inyecta PORT en runtime; 8080 es el fallback local.
ENV PORT=8080
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
# La imagen nginx procesa la plantilla (envsubst de ${PORT}) y arranca sola.
