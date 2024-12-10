
FROM node:16.20.0 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG VITE_BASE_URL
ENV VITE_BASE_URL=$VITE_BASE_URL
RUN npm run build
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
