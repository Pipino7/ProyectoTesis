# ISA-Moda: Sistema de Control de Stock y Ventas para Tienda de Ropa Americana

Este proyecto tiene como objetivo brindar una herramienta de gestión de control de stock y ventas de ropa americana para la tienda ISA-Moda. El sistema permite el registro y la gestión de fardos de ropa, clasificación de prendas, ventas con códigos de barras, y el seguimiento detallado del inventario.

## Tabla de Contenidos

1. [Características Principales](#características-principales)
2. [Tecnologías Utilizadas](#tecnologías-utilizadas)
3. [Comenzando](#comenzando)
   - [Requisitos Previos](#requisitos-previos)
   - [Paso 1: Clonar el Proyecto](#paso-1-clonar-el-proyecto)
   - [Paso 2: Configurar el Archivo `.env`](#paso-2-configurar-el-archivo-env)
   - [Paso 3: Ejecutar el Proyecto con Docker](#paso-3-ejecutar-el-proyecto-con-docker)
4. [Estructura del Proyecto](#estructura-del-proyecto)

5. [Contribuciones](#contribuciones)
6. [Licencia](#licencia)

## Características Principales

- **Gestión de Fardos de Ropa**: Registro y administración de fardos, permitiendo llevar un control preciso de las prendas desde el momento en que llegan al inventario.
  
- **Clasificación de Prendas por Categoría y Precio**: Posibilidad de clasificar prendas en categorías y asignar precios de venta de acuerdo a la calidad y tipo de prenda.

- **Generación y Escaneo de Códigos de Barras**: Creación automática de códigos de barras para cada prenda y fardo, permitiendo escanearlos para facilitar las ventas y la gestión de stock.

- **Módulo de Ventas**: Registro de ventas con control del stock en tiempo real, aplicando descuentos específicos a cada prenda si es necesario.

- **Auditoría de Inventario**: Registro histórico de movimientos en el stock (ingreso, venta, devolución) para mantener un control claro de cada prenda y realizar auditorías periódicas.

- **Interfaz Intuitiva**: Diseño del sistema para que sea fácil de utilizar, optimizando la gestión del inventario y mejorando la experiencia de los administradores.

- **Historial de Fardos y Prendas**: Seguimiento detallado de cada fardo y prenda vendida, incluyendo estados de las prendas como 'disponible', 'vendida' o 'fiado'.

- **Descuentos Personalizados**: Aplicación de descuentos tanto a prendas individuales como al total de una venta.

- **Compatibilidad con Docker**: Configuración para ejecutar el sistema con Docker, permitiendo una implementación y despliegue más rápidos y eficientes.

## Tecnologías Utilizadas

El proyecto ISA-Moda utiliza un conjunto de herramientas y tecnologías modernas para garantizar su funcionamiento eficiente y su despliegue simplificado. A continuación, se describen las principales tecnologías utilizadas:

### Principales Herramientas y Plataformas

- **Docker**: Plataforma para desarrollar, enviar y ejecutar aplicaciones dentro de contenedores.  
  - Versión recomendada: **Docker version 27.4.0,**

- **Docker Compose**: Herramienta para definir y ejecutar aplicaciones multicontenedor con Docker.  
  - Versión recomendada: **2.20.2**

- **Git**: Sistema de control de versiones distribuido para gestionar el código fuente del proyecto.  
  - Versión recomendada: **2.34.1**

- **Node.js**: Entorno de ejecución para JavaScript en el backend.  
  - Versión: **16.20.0**

- **npm**: Administrador de paquetes para Node.js, utilizado para instalar las dependencias del proyecto.  
  - Versión: **8.19.4**

- **PostgreSQL**: Sistema de gestión de bases de datos relacional utilizado para almacenar los datos del proyecto.  
  - Versión: **13.10**

- **Nginx**: Servidor web utilizado para servir la aplicación del frontend en producción.  
  - Versión: **1.25.1**

### Tecnologías del Frontend

- **React**: Biblioteca para construir interfaces de usuario interactivas.  
  - Versión: **18.3.1**

- **Vite**: Herramienta de desarrollo rápido para aplicaciones frontend.  
  - Versión: **5.4.1**

- **Tailwind CSS**: Framework de utilidades CSS para el diseño visual del frontend.  
  - Versión: **3.4.11**

### Tecnologías del Backend

- **TypeORM**: Herramienta de mapeo objeto-relacional para interactuar con la base de datos PostgreSQL.  
  - Versión: **0.3.20**

- **Express.js**: Framework minimalista para aplicaciones web en Node.js.  
  - Versión: **4.19.2**
 

### Otras Dependencias Importantes

- **bcryptjs**: Biblioteca para el hashing de contraseñas.  
  - Versión: **2.4.3**

- **jsonwebtoken**: Biblioteca para gestionar autenticación basada en tokens JWT.  
  - Versión: **9.0.2**

- **dotenv**: Herramienta para gestionar variables de entorno.  
  - Versión: **16.4.5**

- **Joi**: Biblioteca para validaciones de datos en el backend.  
  - Versión: **17.10.2**

### Comenzando

## **Requisitos Previos**

### **1. Docker y Docker Compose**

- Ambos son necesarios para ejecutar el proyecto en contenedores. Docker Compose generalmente viene integrado con Docker en versiones recientes.
- Verifica si tienes Docker instalado ejecutando en la consola:
  ```bash
  docker --version
  ```
  Si Docker está instalado correctamente, deberías ver un resultado similar a:
  ```
  Docker version 20.10.25, build ...
  ```
- Verifica si tienes Docker Compose instalado ejecutando:
  ```bash
  docker-compose --version
  ```
  El resultado esperado es algo como:
  ```
  Docker version 27.4.0
  ```
- **Nota**: Si tienes una versión diferente de Docker o Docker Compose, no debería haber problemas en la mayoría de los casos. Sin embargo, si experimentas errores o comportamientos inesperados, considera actualizar Docker y Docker Compose a las versiones recomendadas:



## **¿Qué hacer si no tienes Docker instalado?**

Si al ejecutar `docker --version` no obtienes ningún resultado, sigue estos pasos para instalar Docker:

### **1. Actualiza el índice de paquetes**
```bash
sudo apt update
```

### **2. Instala los paquetes necesarios para usar el repositorio de Docker**
```bash
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
```

### **3. Añade la clave GPG oficial de Docker**
```bash
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
```

### **4. Añade el repositorio de Docker para Ubuntu**
```bash
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

### **5. Actualiza nuevamente el índice de paquetes**
```bash
sudo apt update
```

### **6. Instala Docker**
```bash
sudo apt install -y docker-ce
```

### **7. Verifica que Docker esté instalado correctamente**
```bash
docker --version
```

---

### **2. Docker y Docker Compose**

## **¿Qué hacer si no tienes Docker Compose instalado?**

Si al ejecutar `docker-compose --version` no obtienes ningún resultado, sigue estos pasos para instalar Docker Compose:

### **1. Descarga la última versión de Docker Compose**
```bash
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
```

### **2. Otorga permisos de ejecución al binario de Docker Compose**
```bash
sudo chmod +x /usr/local/bin/docker-compose
```

### **3. Verifica que Docker Compose esté instalado correctamente**
```bash
docker-compose --version
```

**El resultado esperado es algo como:**
```bash
Docker Compose version 2.20.2
```

### **2. GIT**

   ### **1. Verifica si Git está instalado:**
```bash
git --version
```
El resultado esperado es algo como:
 ```bash
 git version 2.34.1
 ```

## **¿Qué hacer si no tienes Git instalado?**

Git es necesario para clonar el proyecto desde el repositorio. Si no tienes Git instalado, sigue estas instrucciones en **Linux**:
```bash
sudo apt update
sudo apt install git -y
```
El resultado esperado es algo como:
```bash
git version 2.34.1
```

## **Pruebas Locales con Docker**

En esta sección, se explicará cómo configurar y ejecutar el sistema en un entorno local utilizando Docker. Esto es útil para validar el funcionamiento del software antes de desplegarlo en un entorno de producción.

### **Paso 1: Clonar el Repositorio**

Para obtener una copia del proyecto en tu máquina local, sigue los siguientes pasos:

1. Abre una terminal en tu sistema.
2. Ejecuta el siguiente comando para clonar el repositorio:

   ```bash
   git clone https://github.com/Pipino7/ProyectoTesis.git
   ```

3. Una vez clonado, accede al directorio del proyecto:

   ```bash
   cd ProyectoTesis
   ```

4. La prueba local del software se realizará utilizando Docker y el puerto del frontend configurado como `5173`.

---

### **Paso 2: Configuración del archivo .env**

El archivo `.env` es crucial para definir las variables de entorno que utiliza el sistema. A continuación, se describen las configuraciones necesarias para el backend y el frontend. Se proporcionan archivos `example.env` en cada directorio correspondiente para facilitar la configuración.

#### **Backend: Configurar el archivo .env**

1. Localiza el archivo `example.env` en el directorio `Backend/src/config/` y duplícalo:

   ```bash
   cp Backend/src/config/example.env Backend/src/config/.env
   ```

2. Abre el archivo `.env` con tu editor de texto favorito:

   ```bash
   nano Backend/src/config/.env
   ```

3. Configura las siguientes variables de entorno según sea necesario:

   ```env
   PORT=3200
   HOST=0.0.0.0
   DB_URL=postgresql://postgres:mysecretpassword@database:5432/isamoda_db
   ```

4. Guarda y cierra el archivo.

**Nota importante:**
- Para estas pruebas locales, **no es necesario modificar las siguientes variables:**
  ```env
  # JWT Secrets
  ACCESS_JWT_SECRET=<TU_ACCESS_JWT_SECRET>
  REFRESH_JWT_SECRET=<TU_REFRESH_JWT_SECRET>
  RESET_JWT_SECRET=<TU_RESET_JWT_SECRET>

  # Correo para notificaciones
  EMAIL_USER=<TU_CORREO>
  EMAIL_PASS=<TU_CONTRASEÑA_CORREO>
  ```
  Estas variables se pueden dejar como están en el archivo de ejemplo.
- **Base de datos (DB_URL):** Docker Compose configurará automáticamente la conexión a la base de datos con las siguientes credenciales:
  ```env
  DB_URL=postgresql://postgres:mysecretpassword@database:5432/isamoda_db
  ```
  Docker Compose se encargará de crear la base de datos automáticamente.

---

#### **Frontend: Configurar el archivo .env**

1. Localiza el archivo `example.env` en el directorio `Frontend/` y duplícalo:

   ```bash
   cp Frontend/example.env Frontend/.env
   ```

2. Abre el archivo `.env` con tu editor de texto favorito:

   ```bash
   nano Frontend/.env
   ```

3. Configura las siguientes variables de entorno:

   ```env
   VITE_BASE_URL=http://localhost:3200/api
   ```

4. Guarda y cierra el archivo.

**Nota:** Para estas pruebas locales, el puerto del frontend está configurado para usar `5173`. Este puerto debe mantenerse para evitar conflictos y asegurar que el sistema funcione correctamente.

---


### **Paso 3: Ejecutar los contenedores Docker**


1. Asegúrate de que Docker y Docker Compose estén instalados y funcionando correctamente.
2. Ejecuta el siguiente comando desde el directorio raíz del proyecto para levantar los servicios:

   ```bash
   docker-compose up --build
   ```
 **Nota:** Si encuentras problemas de permisos al ejecutar el comando, utiliza sudo al inicio para ejecutarlo con privilegios de superusuario utilizando sudo al inicio del comando "sudo docker-compose up --build"

3. Accede al sistema desde tu navegador:
   - **Frontend**: `http://localhost:5173`
   - **Backend**: `http://localhost:3200`

---

### **Notas adicionales sobre los puertos y configuraciones**

- **Puertos:**
  - El puerto del backend (`PORT`) debe coincidir con el configurado en `VITE_BASE_URL` del frontend.

- **Base de datos:**
  - La base de datos se configura automáticamente por Docker Compose usando las siguientes credenciales:
    ```env
    DB_URL=postgresql://postgres:mysecretpassword@database:5432/isamoda_db
    ```
  - No necesitas realizar ninguna configuración manual para la base de datos en pruebas locales.

- **Pruebas sugeridas:**
  - Para pruebas locales, utiliza los valores predeterminados:
    - **Backend:**
      ```env
      PORT=3200
      ```
    - **Frontend:**
      ```env
      VITE_BASE_URL=http://localhost:3200/api
      ```
### **Paso 4: Acceso al sistema**

1. Una vez que los contenedores estén en ejecución, abre tu navegador y accede al frontend utilizando la siguiente URL:
   ```
   http://localhost:5173
   ```

2. Utiliza las credenciales predefinidas para iniciar sesión en el sistema:
   - **Correo electrónico:** felipepd14@gmail.com
   - **Contraseña:** admin123

3. Nota: Actualmente, solo el módulo de fardos ha sido implementado en la aplicación. Además, se han creado 3 fardos de prueba para testear y explorar la funcionalidad del módulo de fardos.
Puedes utilizar las credenciales proporcionadas para acceder y realizar pruebas.

Una vez finalizadas las pruebas, recuerda detener los contenedores de Docker con el siguiente comando:
```bash
sudo docker-compose down
```   

## **Despliegue Manual en un Servidor**

Después de probar el sistema en el entorno local utilizando Docker, puedes realizar el despliegue manual en un servidor. Este proceso no utiliza Docker y requiere realizar de forma manual los pasos que Docker automatizó.

### **Requisitos del servidor**

Para esta configuración se toma en consideración que el servidor debe tener acceso a una base de datos remota ya configurada. En este caso, se utilizó un servidor PostgreSQL alojado en
un servidor de mi universidad adjunto un ejemplo de URL:

- **URL del servicio:** `pgsqltrans.face.ubiobio.cl`
- **Credenciales utilizadas:**
  ```env
  DB_URL=postgresql://<usuario>:<contraseña>@pgsqltrans.face.ubiobio.cl:5432/<nombre_base_de_datos>
  ```

El servidor debe cumplir con los siguientes requisitos:

Asegúrate de que el servidor cumpla con los siguientes requisitos:

1. **Sistema operativo compatible:** Linux (Ubuntu recomendado).
2. **Herramientas necesarias:**
   - PostgreSQL 13 o superior.
   - Node.js 16.x o superior.
   - Un servidor web como Nginx para servir el frontend (opcional).
3. **Acceso SSH:** Permite realizar configuraciones remotas.

   Para comenzar, necesitas conectarte al servidor utilizando SSH. En este caso, se utilizó un servidor con la distribución Linux Ubuntu 22.04 (Ubuntu Jammy). Usa el siguiente comando para conectarte al servidor:

   ```bash
   ssh -p usuario@direccion_ip_servidor
   ```

   Reemplaza `usuario` con el nombre de usuario proporcionado y `direccion_ip_servidor` con la dirección IP del servidor.

   Una vez conectado, tendrás acceso para instalar las herramientas necesarias y configurar el entorno manualmente.

Si el servidor requiere una contraseña, se te pedirá ingresarla después de ejecutar el comando SSH. Asegúrate de tener la clave de acceso correcta para conectarte con éxito.

Por ejemplo, el proceso podría verse así:

```bash
ssh -p <PUERTO> usuario@146.xx.xx.xx
```

El sistema te pedirá confirmar la conexión si es la primera vez que accedes al servidor. Escribe `yes` para aceptar y, a continuación, ingresa la contraseña si es requerida.

```plaintext
The authenticity of host '[146.xx.xx.xx]:<PUERTO> ([146.xx.xx.xx]:<PUERTO>)' can't be established.
ED25519 key fingerprint is SHA256:j3AmYhjjoyiMYpEUYb4Tq2Q+gPmqO8mVNCzzTTlHat4.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '[146.xx.xx.xx]:<PUERTO>' (ED25519) to the list of known hosts.
usuario@146.xx.xx.xx's password:
Welcome to Ubuntu 22.04.5 LTS (GNU/Linux 5.10.0-32-amd64 x86_64)
```

Una vez autenticado, podrás proceder con los siguientes pasos de configuración.

### **Actualizar el sistema y preparar el entorno**

1. **Actualizar el sistema operativo:**
   Asegúrate de que el sistema esté actualizado antes de instalar cualquier dependencia:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Instalar herramientas básicas:**
   Instala `curl`, que será necesario para descargar herramientas adicionales:
   ```bash
   sudo apt install curl -y
   ```

3. **Instalar NVM (Node Version Manager):**
   NVM permite gestionar diferentes versiones de Node.js en el servidor:
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
   ```

4. **Recargar la configuración del shell:**
   Después de instalar NVM, recarga el entorno de la terminal:
   ```bash
   source ~/.bashrc
   ```

5. **Instalar la última versión LTS de Node.js:**
   Utiliza NVM para instalar la versión estable más reciente de Node.js:
   ```bash
   nvm install node --lts
   ```

6. **Verificar la instalación de Node.js:**
   Comprueba que Node.js se instaló correctamente:
   ```bash
   node -v
   ```
   Deberías ver algo como `v22.9.0` (o la última versión estable disponible).

### **Instalación de PM2**
PM2 es un administrador de procesos que permite ejecutar y supervisar aplicaciones Node.js:
```bash
npm install pm2@latest -g
```

### **Instalación de Git**
Git es necesario para clonar el repositorio del proyecto:
```bash
sudo apt install git -y
```

### **Clonar el proyecto**
1. Navega al directorio donde deseas clonar el proyecto:
   ```bash
   cd /ruta/deseada
   ```

2. Clona el repositorio desde GitHub:
   ```bash
   git clone https://github.com/Pipino7/ProyectoTesis.git
   ```
3. Accede al directorio del proyecto:
   ```bash
   cd <nombre_proyecto>
   ```
4. Configura las variables de entorno del backend:
   ```bash
   cd Backend/src/config/
   cp example.env .env
   nano .env
   ```
   ### **Contenido del archivo `example.env`**
   A continuación, se describe el propósito de cada variable en el archivo de configuración:
   
   ```env
   # Base de datos
   DB_URL=postgresql://<USUARIO>:<CONTRASEÑA>@<HOST>:5432/<NOMBRE_DB>  # Ruta de conexión a la base de datos PostgreSQL. Si tu servidor utiliza un set de credenciales estándar, utiliza el puerto 5432.

   # Backend server
   PORT= # Puerto donde se ejecutará el backend. Si estás usando un puerto público, considera usar el puerto 80. 

   HOST=  # Dirección que escucha el servidor. Usa tu Direccion 14.xx.xxx.x

   # JWT Secrets
   ACCESS_JWT_SECRET=<TU_ACCESS_JWT_SECRET>  # Clave secreta para los tokens de acceso.

   REFRESH_JWT_SECRET=<TU_REFRESH_JWT_SECRET>  # Clave secreta para los tokens de refresco.
   RESET_JWT_SECRET=<TU_RESET_JWT_SECRET>  # Clave secreta para los tokens de restablecimiento de contraseñas.

   # Correo para notificaciones
   EMAIL_USER=<TU_CORREO>  # Correo electrónico para enviar notificaciones.
   EMAIL_PASS=<TU_CONTRASEÑA_CORREO>  # Contraseña asociada al correo anterior.
   ```
   **Nota:** Asegúrate de reemplazar los valores de `<USUARIO>`, `<CONTRASEÑA>`, `<HOST>`, `<NOMBRE_DB>`, y otros campos con tus credenciales reales.

 ### **Iniciar la Aplicación**

1. **Instalar dependencias:**
   En el directorio del backend:
   ```bash
   npm install
   ```
2. **Iniciar el servidor con PM2:**
   ```bash
   pm2 start src/server.js 
   ```
   **Nota:** Tienes que estar dentro de la carpeta Backend "/ProyectoTesis/Backend$ pm2 start src/server.js"

3. **Guardar la configuración de PM2 para reinicios automáticos:**
   ```bash
   pm2 save
   pm2 startup
   ```  
 ### **Configuración del Frontend**

1. **Navegar al directorio del frontend:**
   ```bash
   cd ../frontend/
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

### **3. Añadir el archivo `.env`**

1. **Crear y editar el archivo `.env`** en el directorio del **frontend**:

   ```bash
   nano .env
   ```
2. **Agregar la siguiente configuración al archivo `.env`:**:
   ```bash
   VITE_BASE_URL=http://<HOST>:<PUERTO_EXTERNO>/api
   ```
   > **Nota Importante:**  
   > - Reemplaza `<HOST>` con la **dirección IP pública** del servidor donde está configurado el backend.  
   > - Reemplaza `<PUERTO_EXTERNO>` con el **puerto configurado públicamente** en el servidor Apache.  
   >
   > **Ejemplo:**  
   > Si la IP pública del servidor es `146.83.198.35` y el puerto público configurado es `8080`, entonces el archivo `.env` debe verse así:  
   >
   > ```env
   > VITE_BASE_URL=http://146.83.198.35:8080/api
   > ```
4. **Construir el frontend:**
   ```bash
   npm run build
   ```
   - **Nota**: Tienes que estar dentro de la carpeta Frontend para ejecutar ese comando 
5. **Iniciar el frontend con PM2:**
   ```bash
   pm2 start npm -- run preview 
   ```
   - **Nota**: Tienes que estar dentro de la carpeta Frontend para ejecutar ese comando 

   Si ahora accedes al navegador y escribes `http://146.83.198.35:<PUERTO_4_DIGITOS>` (por ejemplo, `1631 que es el reflejo del 443`), deberías poder ver tu frontend funcionando correctamente.

6. **Guardar la configuración actual de PM2:**
   ```bash
   pm2 save
   ```

7. **Restaurar procesos guardados en caso de caída del servidor:**
   En caso de que el servidor se reinicie o los procesos se detengan, puedes restaurarlos con el siguiente comando:
   ```bash
   pm2 resurrect
   ```
