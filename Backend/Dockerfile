# Usa una imagen específica de Node.js compatible con tus dependencias
FROM node:16.20.0 AS build

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

# Copia el resto de los archivos del proyecto al contenedor
COPY . .

FROM node:16.20.0-slim


WORKDIR /app
COPY --from=build /app /app


EXPOSE 3200

# Define las variables de entorno
ENV PORT=3200
ENV HOST=0.0.0.0  

CMD ["npm", "start"]


