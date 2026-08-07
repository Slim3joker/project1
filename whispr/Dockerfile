FROM node:22-alpine

# ffmpeg wird nur für das OpenAI-Backend gebraucht (Verkleinern/Teilen großer
# Dateien) und für die Dauer-Ermittlung via ffprobe. Kostet ~80 MB, spart aber
# die häufigste Fehlerquelle bei langen Aufnahmen.
RUN apk add --no-cache ffmpeg tini

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --omit=dev && npm cache clean --force

COPY server.js ./
COPY lib ./lib
COPY public ./public

ENV NODE_ENV=production \
    PORT=8098 \
    DATA_DIR=/data \
    OUTPUT_DIR=/transkripte

EXPOSE 8098
VOLUME ["/data", "/transkripte"]

HEALTHCHECK --interval=60s --timeout=5s --start-period=10s \
  CMD wget -qO- http://127.0.0.1:8098/api/config >/dev/null || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.js"]
