FROM node:22.12.0-alpine AS base
WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
RUN npm prune --production

FROM node:22.12.0-alpine AS application
WORKDIR /app

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist

USER node
ENV APP_PORT=8080
EXPOSE 8080

CMD ["node", "dist/main.js"]
