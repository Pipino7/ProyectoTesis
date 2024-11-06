# Usa una imagen específica de Node.js compatible con tus dependencias
FROM node:16.20.0 AS build

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos de configuración de dependencias primero
# para aprovechar la cache de Docker y acelerar la construcción
COPY package*.json ./

# Instala solo las dependencias de producción en el contenedor
RUN npm install --only=production

# Copia el resto de los archivos del proyecto al contenedor
COPY . .


# Usa una imagen más ligera para ejecutar la aplicación en producción
FROM node:16.20.0-slim

# Establece el directorio de trabajo para la imagen final
WORKDIR /app

# Copia solo las dependencias de node_modules y el código fuente desde la fase de construcción
COPY --from=build /app /app

# Expone el puerto en el que se ejecutará el backend
EXPOSE 3200

# Define las variables de entorno necesarias para la conexión con PostgreSQL y otros servicios
ENV PORT=3200
ENV HOST=0.0.0.0  

# Define el comando de inicio
CMD ["npm", "start"]

# Para modo de desarrollo (si es necesario)
# CMD ["npm", "run", "dev"]
