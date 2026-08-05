# Optionaler, in sich geschlossener Image-Build.
# Nur noetig, wenn du die App als fertiges Image ausliefern willst,
# ohne das Repo auf dem Server zu klonen. Fuer den normalen Betrieb
# reicht docker-compose.yml (bind-mount + git pull) voellig aus.
FROM nginx:alpine

# App und Server-Konfiguration ins Image kopieren
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html        /usr/share/nginx/html/index.html

EXPOSE 80
