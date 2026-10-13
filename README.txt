API REST con Node.js, Express y MySQL.

REQUISITOS
-Node.js
-MySQL

INSTALACION
1 Ejecutar el archivo database.sql en MySQL.
2 Crear un archivo .env en la raiz del proyecto con este contenido:
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=tu_clave
   DB_NAME=api_clientes
   PORT=3000

3 Instalar dependencias->npm install
4 Iniciar el servidor->npm start

Se aloja el servidor en-> http://localhost:3000

ENDPOINTS
POST   /clientes     ->  Crear cliente
GET    /clientes     ->  Listar clientes
GET    /clientes/:id ->  Obtener un cliente
PUT    /clientes/:id ->  Actualizar cliente
DELETE /clientes/:id ->  Eliminar cliente

CODIGOS DE RESPUESTA
200 OK, 201 Creado, 400 Datos invalidos, 404 No encontrado,
409 Email duplicado, 500 Error del servidor

SEGURIDAD
Consultas preparadas para prevenir inyeccion SQL con mysql2.
-------------------------------------------------------------------

-> Pruebas Postman dentro de carpeta postman/collections.