FROM node:22-alpine

# Keine npm-Abhängigkeiten – der Server nutzt nur Node-Bordmittel.
WORKDIR /app
COPY server.js ./
COPY public ./public

ENV PORT=8477 \
    DATA_DIR=/data

# Daten liegen im Volume, nicht im Image
VOLUME ["/data"]
EXPOSE 8477

# Nicht als root laufen; /data gehört dem node-User
RUN mkdir -p /data && chown -R node:node /data /app
USER node

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s \
  CMD wget -q -O /dev/null http://127.0.0.1:8477/api/status || exit 1

CMD ["node", "server.js"]
