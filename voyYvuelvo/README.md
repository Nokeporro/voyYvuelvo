# Voy y Vuelvo — Backend

Backend Spring Boot con cinco microservicios, API Gateway, Eureka y MySQL. El frontend React está en la carpeta hermana `../frontend/`.

Para la instalación completa, consulta el [README principal](../README.md). La [guía detallada de integración](../frontend/docs/INTEGRACION-FRONTEND-BACKEND.md) explica HTTP, JSON, CORS, Feign, persistencia y la creación de reservas desde React.

## Estructura

```text
voyYvuelvo/
  infrastructure/
    api-gateway/      Entrada HTTP, autenticación y enrutamiento
    eureka-server/    Registro de servicios
  services/
    ms-equipamiento/  Catálogo y recomendaciones de arriendo
    ms-pago/          Pagos de las reservas
    ms-reserva/       Reservas, cupos y comunicación entre servicios
    ms-ruta/          Rutas de trekking
    ms-usuario/       Contactos de las reservas
  docs/
    diagramas/        Diagramas C4
    GUIA-BACKEND.md   Endpoints, CRUD y guía detallada de verificación
  .mvn/               Configuración del Maven Wrapper compartido
  mvnw, mvnw.cmd      Maven para Linux/macOS y Windows
  pom.xml             Agregador de los siete módulos Java
  docker-compose.yml  Despliegue local completo
```

Cada módulo conserva su `pom.xml`, `Dockerfile`, `src/main/` y `src/test/`. El código se organiza en `controller/`, `service/`, `repository/`, `model/`, `dto/`, `client/` y `config/`, según corresponda. Los DTO de reservas están en `dto/`; las entidades de usuarios están en `model/`.

Los nombres internos de las aplicaciones, los artefactos Maven y los contenedores se conservan para mantener las integraciones existentes. La carpeta antes llamada `api-getaway/` está ahora en `infrastructure/api-gateway/`.

## Iniciar con Docker

Requiere Docker Desktop en modo contenedores Linux. Desde esta carpeta:

```powershell
docker compose up -d --build
docker compose ps
docker compose logs --tail 60 api-gateway
```

Los Dockerfile comparten una caché Maven de BuildKit para reutilizar dependencias entre servicios y reintentos de construcción. La compilación utiliza salida sin progreso de descargas.

MySQL conserva sus datos en el volumen `mysql_data`. Si una aplicación arranca antes de que sus dependencias estén listas, revisa los logs y reinicia el servicio cuando MySQL y Eureka estén disponibles.

| Componente | Puerto |
| --- | --- |
| API Gateway | 8080 |
| Eureka | 8761 |
| Equipamiento | 8081 |
| Reservas | 8083 |
| Usuarios | 8084 |
| Pagos | 8085 |
| Rutas | 8086 |
| MySQL | 3306 |

El frontend utiliza `VITE_API_URL=http://localhost:8080` en su `.env`. Las cuentas locales del frontend y los contactos del microservicio de usuarios tienen modelos distintos; consulta [la integración](../frontend/docs/CONEXION-BACKEND.md).

## Compilar y ejecutar pruebas

Requiere JDK 21 y `JAVA_HOME` configurado. El wrapper descarga Maven si hace falta. Ejecuta estos comandos desde la raíz del backend:

```powershell
# Compilar y empaquetar los siete módulos sin ejecutar pruebas de contexto.
.\mvnw.cmd -DskipTests package

# Pruebas unitarias de reservas, sin MySQL ni otros servicios.
.\mvnw.cmd -pl services/ms-reserva "-Dtest=ReservaServiceTest" test

# Compilar solamente un módulo.
.\mvnw.cmd -pl services/ms-ruta -DskipTests package
```

En Linux/macOS usa `./mvnw`. También puedes seleccionar un POM con `-f services/ms-ruta/pom.xml`. Los JAR y reportes se generan en `target/` dentro de cada módulo. `pom.xml` agrega los proyectos sin cambiar sus dependencias ni sus versiones.

Las pruebas `*ApplicationTests` cargan Spring y algunas necesitan MySQL. La [guía detallada](docs/GUIA-BACKEND.md) explica las opciones de conexión y el CRUD. El perfil `test` de reservas usa `create-drop`: no debe apuntar a una base con datos que quieras conservar.

Con Docker y el frontend iniciados, `npm run test:integration` desde `../frontend/` comprueba las API reales, Eureka y CORS. La opción `-- --write-test` añade una reserva con datos temporales propios y comprueba su limpieza y la restauración de cupos. Consulta [la verificación de integración](../frontend/docs/CONEXION-BACKEND.md).

## Detener

```powershell
docker compose stop
```

`docker compose down` retira contenedores y red, conservando el volumen mientras no agregues `-v`.

Los resultados `target/`, los logs y la configuración personal del IDE están ignorados por Git y excluidos de los contextos de construcción Docker.
