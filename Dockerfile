# Multi-stage build for Google Cloud Run (also works on any container host).
# Deploy: gcloud run deploy serene --source . --region <REGION> \
#           --allow-unauthenticated --set-env-vars GEMINI_API_KEY=<key>
# Cloud Run injects PORT (8080); server.ts already listens on 0.0.0.0:$PORT.

# --- build stage: install everything and produce dist/ (client assets + server.cjs) ---
FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- runtime stage: production deps only + the built bundle ---
FROM node:22-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
EXPOSE 8080
CMD ["node", "dist/server.cjs"]
