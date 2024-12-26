FROM node:23

# Establecer el directorio de trabajo en el contenedor
WORKDIR /app

# Configurar la zona horaria
ARG TIMEZONE=America/New_York
ENV TZ=$TIMEZONE
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Copiar los archivos de configuración de la aplicación
COPY package*.json ./

# Instalar las dependencias
RUN npm cache clean --force && npm install

# Copiar el código fuente de la aplicación
COPY . .

# Exponer el puerto 3800
EXPOSE 3800

# Ejecutar la aplicación usando Bash
CMD ["bash", "-c", "npx ts-node src/index.ts"]
