# frontend/Dockerfile

# --- Stage 1: build the Vite production bundle ------------------------------
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

# API base URL is baked into the bundle at build time (Vite).
ARG VITE_API_BASE_URL=http://localhost:8000/api/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY . .
RUN npm run build

# --- Stage 2: nginx runtime -------------------------------------------------
FROM nginx:1.27-alpine AS runtime
WORKDIR /usr/share/nginx/html

# Remove the default nginx site and replace with an SPA-aware config.
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist ./

EXPOSE 80

# Basic liveness probe (nginx responds to /healthz).
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -qO- http://127.0.0.1/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
