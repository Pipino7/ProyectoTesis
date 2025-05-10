
FROM node:16.20.0-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production
FROM node:16.20.0-slim AS runner
WORKDIR /app
RUN useradd --user-group --create-home --shell /bin/false appuser
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3200
USER appuser
EXPOSE 3200
CMD ["node", "src/server.js"]
