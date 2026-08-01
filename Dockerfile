# Abend-Hub - schlankes Image, keine npm-Abhaengigkeiten noetig.
FROM node:20-alpine

WORKDIR /app

# Nur die noetigen Dateien kopieren
COPY package.json ./
COPY server.js ./
COPY ical.js ./
COPY public ./public

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Laeuft als non-root
USER node

CMD ["node", "server.js"]
