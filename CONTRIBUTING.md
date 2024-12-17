# Guía de Contribución al Proyecto ISA-Moda

A continuación se presenta un archivo de guía completo y paso a paso para contribuir al proyecto **ISA-Moda: Sistema de Control de Stock y Ventas para Tienda de Ropa Americana**. Este documento está diseñado para que cualquier desarrollador pueda familiarizarse con el repositorio, la configuración del entorno, la estructura del proyecto y las normas de contribución.

## 1. Datos Generales del Proyecto

**Nombre del Proyecto:**  
ISA-Moda: Sistema de Control de Stock y Ventas para Tienda de Ropa Americana

**Propósito del Proyecto:**  
El proyecto busca ofrecer una herramienta de gestión de inventario, clasificación de prendas, generación de códigos de barras, registro de ventas, aplicación de descuentos y auditoría del stock en una tienda de ropa americana.

**Stack Tecnológico Principal:**
```
* **Backend:** Node.js (Express.js), TypeORM, PostgreSQL
* **Frontend:** React, Vite, Tailwind CSS
* **Contenedores:** Docker, Docker Compose
* **Infraestructura recomendada:** Nginx para producción
* **Control de versiones:** Git y GitHub
```

---

## 2. Repositorio y Control de Versiones

**Repositorio GitHub:**  
[https://github.com/Pipino7/ProyectoTesis.git](https://github.com/Pipino7/ProyectoTesis.git)

**Control de Versiones:** Git  
Se asume familiaridad básica con Git. Si no dispones de Git instalado, revisa el README para los pasos de instalación.

---

## 3. Instrucciones para el Entorno de Desarrollo

### 3.1 **Requisitos Previos**

Para desarrollar localmente, asegúrate de tener instalado:

```
* Docker y Docker Compose
* Git
* Node.js (opcional, si no se usa Docker)
* PostgreSQL (opcional, si no se usa Docker)
```

> **Nota:** Se recomienda usar **Docker** para simplificar la configuración del entorno.

---

### 3.2 **Archivo README**

El repositorio contiene un archivo **README.md** con:

```
* Características del sistema
* Tecnologías utilizadas
* Instrucciones de configuración
* Estructura del proyecto
* Guía básica de contribución
```

> **Nota Importante:** Todo lo relacionado con comandos como `npm install`, configuraciones específicas del entorno, y detalles de ejecución se encuentran explicados más a fondo en el archivo README.md. La guía de contribución proporciona un panorama general del proceso.

---

### 3.3 **Archivos .env y Ejemplos**

El proyecto usa variables de entorno. Se proveen archivos **example.env** como plantilla.

#### **Backend**

Ubicación: `Backend/src/config/example.env`

**Comando para crear .env:**
```bash
cp Backend/src/config/example.env Backend/src/config/.env
```

Ejemplo de variables:
```env
PORT=3200
HOST=0.0.0.0
DB_URL=postgresql://postgres:mysecretpassword@database:5432/isamoda_db
ACCESS_JWT_SECRET=TU_ACCESS_JWT_SECRET
EMAIL_USER=TU_CORREO
```

#### **Frontend**

Ubicación: `Frontend/example.env`

**Comando para crear .env:**
```bash
cp Frontend/example.env Frontend/.env
```

Ejemplo de variables:
```env
VITE_BASE_URL=http://localhost:3200/api
```

---

## 4. Estructura del Proyecto

La estructura del proyecto es la siguiente:

```plaintext
ProyectoTesis/
├── Backend/
│   ├── src/
│   │   ├── config/       # Archivos de configuración
│   │   ├── controllers/  # Controladores
│   │   ├── entities/     # Entidades TypeORM
│   │   ├── middlewares/  # Middlewares
│   │   ├── routes/       # Rutas
│   │   ├── schema/       # Esquemas de validación
│   │   ├── services/     # Lógica de negocio
│   ├── Dockerfile
│   └── package.json
│
├── Frontend/
│   ├── src/
│   │   ├── assets/       # Recursos estáticos (imágenes, fuentes, etc.)
│   │   ├── components/   # Componentes reutilizables de React
│   │   ├── guards/       # Protección de rutas
│   │   ├── hooks/        # Hooks personalizados
│   │   ├── pages/        # Páginas completas
│   │   ├── routes/       # Definición de rutas
│   │   ├── services/     # Consumo del backend
│   │   ├── Validation/   # Validaciones del frontend
│   │   ├── App.css       # Estilos globales
│   │   ├── App.jsx       # Punto de entrada principal de la app
│   │   ├── index.css     # Estilos generales del proyecto
│   │   └── main.jsx      # Archivo principal para ReactDOM
│   ├── Dockerfile
│   └── package.json
│
└── README.md
```

---

## 5. Instrucciones de Contribución

### **Paso 1: Fork del Repositorio**
1. Ingresa al repositorio principal.
2. Haz clic en **Fork**.

### **Paso 2: Clonar el Repositorio**
```bash
git clone https://github.com/<tu_usuario>/ProyectoTesis.git
cd ProyectoTesis
```

### **Paso 3: Crear una Rama**
```bash
git checkout -b feature/nueva-funcionalidad
```

### **Paso 4: Instalar Dependencias**
#### Backend:
```bash
cd Backend
npm install
```
#### Frontend:
```bash
cd Frontend
npm install
```

### **Paso 5: Ejecutar el Proyecto**

**Con Docker:**
```bash
docker-compose up --build
```

**Localmente:** Ejecuta el backend y frontend manualmente.

---

### **Paso 6: Hacer Commit y Pull Request**

1. Agrega tus cambios.
```bash
git add .
git commit -m "Descripción breve del cambio"
```
2. Utiliza prefijos adecuados en los commits para indicar el tipo de cambio:

* feat: nueva funcionalidad
* fix: corrección de errores
* chore: tareas de mantenimiento
* docs: actualización de la documentación
* refactor: refactorización de código
* style: ajustes de estilo o formato
* test: añadir o corregir pruebas
* perf: mejoras de rendimiento
```
3. Envía los cambios a tu fork.
```bash
git push origin feature/nueva-funcionalidad
```
4. Crea un Pull Request desde GitHub.

---

## 7. Convenciones de Código

* **Estilo:** CamelCase para todas las funciones, variables y componentes.
* **Linter:** Se recomienda usar **ESLint** 
* **Commits:** Descripciones claras y concisas con prefijos según el tipo de cambio.

Ejemplo:
```bash
git commit -m "fix: corrige error en generación de códigos de barras"
```

---

## 8. Problemas Conocidos

* **Funcionalidad de reset de password** incompleta.
* **Documentación de la API** pendiente.

---

## 9. Contacto y Soporte

Si encuentras algún problema o tienes preguntas sobre el proyecto, puedes contactarnos a través de:
* **Correo electrónico:** felipepd14@gmail.com
* **GitHub Issues:** [Abrir un nuevo Issue](https://github.com/Pipino7/ProyectoTesis/issues)


**¡Gracias por contribuir a ISA-Moda!
