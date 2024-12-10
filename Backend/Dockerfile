# Usa una imagen ligera y específica de Node.js
FROM node:16.20.0-slim

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de configuración de dependencias
COPY package*.json ./

# Instala solo las dependencias necesarias para producción
RUN npm install --only=production

# Copia el resto de los archivos del proyecto
COPY . .

# Expone el puerto del backend
EXPOSE 3200

# Define el comando de inicio del backend
CMD ["npm", "start"]
