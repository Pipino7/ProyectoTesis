# ISA-Moda: Sistema de Control de Stock y Ventas para Tienda de Ropa Americana

Este proyecto tiene como objetivo brindar una herramienta de gestión de control de stock y ventas de ropa americana para la tienda ISA-Moda. El sistema permite el registro y la gestión de fardos de ropa, clasificación de prendas, ventas con códigos de barras, y el seguimiento detallado del inventario.

## Tabla de Contenidos

1. [Características Principales](#características-principales)
2. [Comenzando](#comenzando)
   - [Requisitos Previos](#requisitos-previos)
   - [Paso 1: Clonar el Proyecto](#paso-1-clonar-el-proyecto)
   - [Paso 2: Configurar el Archivo `.env`](#paso-2-configurar-el-archivo-env)
   - [Paso 3: Ejecutar el Proyecto con Docker](#paso-3-ejecutar-el-proyecto-con-docker)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Tecnologías Utilizadas](#tecnologías-utilizadas)
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

## Comenzando

A continuación se detallan los pasos necesarios para obtener y ejecutar el proyecto en tu máquina local. Se **requiere** utilizar Docker para simplificar la configuración y ejecución del proyecto.

### Requisitos Previos

1. **Docker y Docker Compose**:
   - Ambos son necesarios para ejecutar el proyecto en contenedores. Docker Compose generalmente viene integrado con Docker en versiones recientes.
   - Verifica la instalación de Docker Compose ejecutando en la consola de comandos:
     ```bash
     docker-compose --version
     ```
   - Si no tienes Docker Compose, consulta la [guía de instalación de Docker Compose](https://docs.docker.com/compose/install/).

2. **Git**:
   - Necesario para clonar el proyecto desde el repositorio. Si no tienes Git instalado, sigue estas instrucciones en **Linux**:
     ```bash
     sudo apt update
     sudo apt install git -y
     ```

3. **Acceso a Internet**:
   - Necesario para descargar las dependencias y configuraciones necesarias para el proyecto.

4. **Base de Datos PostgreSQL**:
   - Si deseas utilizar una base de datos PostgreSQL localmente, necesitas instalar PostgreSQL en tu sistema.
   - **Instalación de PostgreSQL en Linux**:
     1. **Actualiza los paquetes**:
        ```bash
        sudo apt update
        ```
     2. **Instala PostgreSQL**:
        ```bash
        sudo apt install postgresql postgresql-contrib -y
        ```
     3. **Inicia el servicio de PostgreSQL**:
        ```bash
        sudo service postgresql start
        ```
     4. **Verifica la instalación**:
        ```bash
        psql --version
        ```
     5. **Configura un usuario y una base de datos**:
        ```bash
        sudo -u postgres psql
        ```
        En la consola de PostgreSQL, ejecuta:
        ```sql
        CREATE DATABASE isamoda;
        CREATE USER mi_usuario WITH ENCRYPTED PASSWORD 'mi_contraseña';
        GRANT ALL PRIVILEGES ON DATABASE isamoda TO mi_usuario;
        \q
        ```
     6. **Obtén el enlace de conexión** para el archivo `.env`:
        ```
        postgresql://mi_usuario:mi_contraseña@localhost:5432/isamoda
        ```
   - Si prefieres utilizar una base de datos PostgreSQL en un **servidor remoto**, asegúrate de tener las credenciales de conexión y el enlace de conexión en el formato adecuado:
     ```
     postgresql://usuario_remoto:contraseña_remota@host_remoto:5432/nombre_base_datos
     ```

### Paso 1: Clonar el Proyecto

Abre una consola y ejecuta los siguientes comandos para clonar el proyecto:

```bash
git clone https://github.com/usuario/proyecto-ISA-Moda.git
cd proyecto-ISA-Moda
