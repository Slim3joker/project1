FROM node:20-bookworm-slim AS build
WORKDIR /app
COPY package.json ./
# python3/make/g++ nur falls better-sqlite3 kein Prebuilt-Binary findet
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && npm install --omit=dev \
  && apt-get purge -y python3 make g++ \
  && apt-get autoremove -y \
  && rm -rf /var/lib/apt/lists/*

FROM node:20-bookworm-slim
ENV NODE_ENV=production \
    TZ=Europe/Berlin \
    DATA_DIR=/data \
    PORT=3000
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src
COPY public ./public
VOLUME /data
EXPOSE 3000
CMD ["node", "src/server.js"]
