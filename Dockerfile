
FROM node:alpine
WORKDIR /app

# Instalar herramientas necesarias
RUN apk add --no-cache bash curl nano tzdata
RUN echo "umask 0000" >> /etc/profile

# Configurar Bash como shell predeterminado
SHELL ["/bin/bash", "-c"]


ARG TIMEZONE=America/New_York
ENV TZ=$TIMEZONE
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Copiar archivos de configuración e instalar dependencias
COPY package*.json ./
RUN npm install
COPY . .


EXPOSE 3800
# Iniciar Bash y ejecutar la aplicación
CMD ["bash", "-c", "npx ts-node src/index.ts"]
