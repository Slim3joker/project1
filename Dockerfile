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
    PORT=3000 \
    PYTHON_BIN=/opt/venv/bin/python3
# GARTH_TOKEN_DIR wird bewusst nicht gesetzt — Node und Poller leiten den Pfad
# aus DATA_DIR ab (/data/garth). Vermeidet zugleich Dockers SecretsUsedInArgOrEnv-Warnung.
WORKDIR /app

# Python-Umgebung für den Garmin-Connect-Abruf (poller/)
COPY poller/requirements.txt /tmp/requirements.txt
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 python3-venv ca-certificates \
  && python3 -m venv /opt/venv \
  && /opt/venv/bin/pip install --no-cache-dir --upgrade pip \
  && /opt/venv/bin/pip install --no-cache-dir -r /tmp/requirements.txt \
  && rm -rf /var/lib/apt/lists/* /tmp/requirements.txt

COPY --from=build /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src
COPY public ./public
COPY poller ./poller
VOLUME /data
EXPOSE 3000
CMD ["node", "src/server.js"]
