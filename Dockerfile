
FROM node:23
WORKDIR /app
RUN apt-get update && apt-get install -y nano curl
ARG TIMEZONE=America/New_York
ENV TZ $TIMEZONE
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Copiar los archivos de configuración de la aplicación
COPY package*.json ./

# Copiar el código fuente de la aplicación al contenedor
COPY . .


RUN npm cache clean --force && npm install
EXPOSE 3800

CMD ["npx", "ts-node", "src/index.ts" ]

#WORKDIR directorio de la aplicación en el contenedor