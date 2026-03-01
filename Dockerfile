FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev

FROM node:20-alpine
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
COPY src ./src
RUN chown -R appuser:appgroup /app
USER appuser
EXPOSE 8083
ENV NODE_ENV=production
ENV PORT=8083
CMD ["node", "src/app.js"]