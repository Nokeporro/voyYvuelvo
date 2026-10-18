# Voy & Vuelvo

Plataforma de gestión de actividades de trekking implementada en Java 21 y Spring Boot. Administra usuarios, rutas, equipamiento, reservas y pagos mediante cinco microservicios, un Gateway, Eureka y MySQL.

## Integrantes

- Michel Sanhueza.
- Franco Araya.

## 1. Arquitectura y estructura

Docker Compose despliega siete aplicaciones Java y un contenedor MySQL. Cada aplicación tiene su propio `pom.xml`; no existe un POM agregador en esta carpeta.

| Carpeta / servicio Compose | Puerto local | Responsabilidad | Esquema MySQL |
| --- | --- | --- | --- |
| `api-getaway` / `api-gateway` | 8080 | Enrutamiento y autenticación | `bd_gateway` |
| `eureka-server` / `eureka` | 8761 | Registro de servicios | No utiliza |
| `ms-usuario` | 8084 | Creación, consulta y eliminación de usuarios | `bd_usuario` |
| `ms-equipamiento` | 8081 | CRUD de equipamiento y recomendaciones | `bd_equipamiento` |
| `ms-ruta` | 8086 | Catálogo de rutas y modificación de cupos | `bd_ruta` |
| `ms-reserva` | 8083 | Reservas y coordinación con otros servicios | `bd_reserva` |
| `ms-pago` | 8085 | CRUD y estado de pagos | `bd_pago` |
| MySQL / `mysql` | 3306 | Persistencia de los esquemas anteriores | Varios |

Se conserva el nombre real de la carpeta `api-getaway`.

```text
voyYvuelvo/                 # Carpeta interna del repositorio
├── README.md
├── docker-compose.yml
├── api-getaway/
├── eureka-server/
├── ms-usuario/
├── ms-equipamiento/
├── ms-ruta/
├── ms-reserva/
└── ms-pago/
```

Los microservicios organizan su código en capas:

- `controller`: recibe peticiones HTTP y construye respuestas.
- `service`: implementa la lógica y coordina dependencias.
- `repository`: interfaces Spring Data JPA para acceder a MySQL.
- `model` o `models`: entidades persistentes con anotaciones JPA.
- `dto`, `client` y `exception`: datos de entrada/salida, clientes HTTP y manejo de errores, según el servicio.

Ejemplo: Postman → `EquipamientoController` → `EquipamientoService` → `EquipamientoRepository` → MySQL.

### Entidades y referencias

`Equipamiento` utiliza `@Entity`, `@Table(name = "equipamiento")`, `@Id` y `@GeneratedValue(strategy = GenerationType.IDENTITY)`. Su repositorio extiende `JpaRepository<Equipamiento, Long>` y proporciona consultas por disponibilidad y dificultad.

Las otras entidades de negocio son `Usuario`, `Ruta`, `Reserva` y `Pago`. Las reservas referencian usuarios y rutas mediante IDs; los pagos referencian reservas mediante `idReserva`. Las llamadas entre microservicios utilizan OpenFeign. `Reserva` también persiste una colección de valores `ReservaEquipamiento` mediante `@ElementCollection`, `@CollectionTable` y `@JoinColumn`; sus elementos son `@Embeddable` e incluyen el ID del equipamiento y su cantidad.

**Alcance respecto de IE6:** existe el mapeo de la colección de equipamientos de una reserva, pero no se encontraron relaciones `@OneToMany` o `@ManyToOne` en las entidades revisadas. Mostrar el mapeo real y revisar con el docente cómo se aplica el requisito de relaciones de la pauta a esta arquitectura.

## 2. Requisitos

- Git.
- Docker Engine y Docker Compose v2. En Windows: Docker Desktop iniciado con contenedores Linux.
- Acceso a internet para descargar imágenes y dependencias.
- Puertos disponibles: 3306, 8080, 8081, 8083, 8084, 8085, 8086 y 8761.
- Postman o una herramienta HTTP equivalente.
- **JDK 21** si se compila o ejecuta un JAR desde el equipo. Las imágenes Docker ya incluyen Java y Maven.

Los comandos están escritos para **PowerShell en Windows**. En Linux/macOS, adaptar las rutas y utilizar `./mvnw` en lugar de `.\mvnw.cmd`.

No es obligatorio instalar Maven globalmente: cada aplicación incluye Maven Wrapper, que descarga la versión configurada en `.mvn/wrapper/maven-wrapper.properties`.

```powershell
git --version
docker --version
docker compose version
docker info
java -version
```

`docker info` debe mostrar información del servidor. Para la compilación local, comprobar Java 21 y `JAVA_HOME`.

## 3. Clonar el repositorio

Desde una carpeta donde todavía no exista `voy-vuelvo`:

```powershell
git clone https://github.com/Nokeporro/voyYvuelvo.git voy-vuelvo
cd .\voy-vuelvo\voyYvuelvo
Get-ChildItem
```

La raíz Git contiene una carpeta interna `voyYvuelvo`. Deben verse `docker-compose.yml` y los siete componentes Java. Ejecutar los siguientes comandos Compose desde esa carpeta interna.

En el equipo original de desarrollo, la carpeta equivalente es:

```powershell
cd C:\Users\nokep\Documents\1_PROYECTOS_code\backend\voyYvuelvo
```

## 4. Instalar dependencias y ejecutar con Docker

### 4.1 Preparar MySQL

Abrir Docker Desktop y ejecutar:

```powershell
docker compose up -d mysql
docker compose logs --tail 40 mysql
```

Esperar el mensaje `ready for connections` del arranque definitivo de MySQL. Compose utiliza `root` sin contraseña para esta demostración local y publica el puerto 3306.

### 4.2 Construir y levantar las aplicaciones

```powershell
docker compose up -d --build
docker compose ps
docker compose logs --tail 60 ms-equipamiento
```

Cada Dockerfile descarga las dependencias del `pom.xml` y ejecuta `mvn clean package -DskipTests` en una etapa con Maven y Java 21. Después copia el JAR a la imagen de ejecución. **La construcción Docker omite las pruebas**; ejecutarlas expresamente según la sección 6.

La primera construcción puede tardar varios minutos. `depends_on` ordena el inicio, pero el Compose actual no comprueba que las dependencias estén listas. Si una aplicación falla durante ese arranque, revisar sus logs y reiniciarla cuando MySQL y Eureka estén disponibles:

```powershell
docker compose restart eureka
docker compose restart api-gateway ms-usuario ms-equipamiento ms-ruta ms-reserva ms-pago
```

Esperar el arranque y revisar que no persistan errores. El estado `Up` por sí solo no demuestra que la API esté disponible.

### 4.3 Verificar el despliegue

- Eureka: <http://localhost:8761>. Comprobar el registro de los servicios.
- Swagger de equipamiento: <http://localhost:8081/swagger-ui.html>.
- Swagger del Gateway: <http://localhost:8080/swagger-ui.html>.

En Postman:

```http
GET http://localhost:8081/api/equipamiento
GET http://localhost:8080/api/equipamiento
GET http://localhost:8084/api/usuarios
GET http://localhost:8086/api/rutas
GET http://localhost:8083/api/reservas
GET http://localhost:8085/api/pagos
```

Las consultas a colecciones deben responder 200; una colección vacía es válida. Algunas respuestas usan HATEOAS con `_links` y `_embedded`.

## 5. Persistencia y dependencias

Cada microservicio tiene `src/main/resources/application.properties`; el Gateway usa `application.yaml`. Ejemplo de equipamiento:

```properties
spring.datasource.url=jdbc:mysql://mysql:3306/bd_equipamiento?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
eureka.client.service-url.defaultZone=http://eureka:8761/eureka/
```

Dentro de Docker, `mysql`, `eureka` y los nombres de los microservicios se resuelven en su red interna. Desde Windows se usan `localhost` y los puertos publicados. La URL permite crear el esquema y Hibernate administra sus tablas con `ddl-auto=update`.

| Dependencia / plugin | Uso, según el componente |
| --- | --- |
| Spring Boot Web | Controladores REST |
| Spring Data JPA | Repositorios y persistencia Hibernate |
| MySQL Connector/J | Conexión JDBC |
| Spring Boot Validation | Validaciones con `@Valid` |
| Eureka Client / Server | Registro y descubrimiento |
| OpenFeign | Llamadas entre servicios |
| HATEOAS y Springdoc | Enlaces de recursos y OpenAPI |
| Spring Boot Test, JUnit y Mockito | Pruebas de contexto y lógica |
| `spring-boot-maven-plugin` | JAR ejecutable |

El Gateway tiene además dependencias de enrutamiento y seguridad. Aunque implementa autenticación JWT, **las cinco familias de rutas `/api/...` están permitidas sin token en la configuración actual**; no presentarlas como protegidas.

## 6. Maven: compilar, ejecutar pruebas y generar el JAR

### 6.1 Equipamiento con pruebas de contexto

Con MySQL de Docker disponible en `localhost:3306`, desde la carpeta de Compose:

```powershell
cd .\ms-equipamiento
.\mvnw.cmd -v
.\mvnw.cmd clean install "-Dspring.datasource.url=jdbc:mysql://localhost:3306/bd_equipamiento_test?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC" "-Deureka.client.enabled=false"
```

El comando limpia, compila, ejecuta tests, empaqueta e instala el artefacto en el repositorio Maven local. La prueba usa el esquema separado `bd_equipamiento_test` y desactiva Eureka. No modifica los archivos de configuración del despliegue.

Comprobar `Tests run`, ausencia de fallos/errores y `BUILD SUCCESS`. El test existente de equipamiento comprueba la carga del contexto Spring; no es una suite exhaustiva del CRUD. Para persistencia efectiva, realizar la sección 8.

```powershell
Get-ChildItem .\target\surefire-reports
Get-ChildItem .\target\*.jar
```

JAR esperado: `target/ms-equipamiento-0.0.1-SNAPSHOT.jar`.

| Comando | Función |
| --- | --- |
| `clean` | Elimina `target` |
| `compile` | Compila clases |
| `test` | Ejecuta pruebas |
| `package` | Ejecuta las fases hasta generar el JAR |
| `install` | Ejecuta las fases hasta instalar el artefacto localmente |

`install` incluye `test` y `package`: no es obligatorio repetirlos por separado. Si se ejecutan `test`, `package` o `install` de equipamiento desde Windows, conservar los dos argumentos de configuración del ejemplo. `-DskipTests` omite pruebas y no demuestra que hayan pasado.

### 6.2 Pruebas unitarias de reservas

Desde `ms-equipamiento`:

```powershell
cd ..\ms-reserva
.\mvnw.cmd "-Dtest=ReservaServiceTest" test
```

Ejecuta solo `ReservaServiceTest`, con cinco casos JUnit/Mockito: creación exitosa, usuario inexistente, reserva duplicada, ruta inexistente y falta de cupos. Usa colaboradores simulados, sin MySQL ni otros servicios. No representa la suite completa de reservas.

No activar el perfil `test` de reservas sobre datos que se quieran conservar: su archivo configura `ddl-auto=create-drop` sobre `bd_reserva`.

### 6.3 Ejecutar el JAR fuera de Docker

Desde `ms-equipamiento`, con el JAR construido y MySQL disponible:

```powershell
java -jar .\target\ms-equipamiento-0.0.1-SNAPSHOT.jar --server.port=18081 "--spring.datasource.url=jdbc:mysql://localhost:3306/bd_equipamiento?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC" --eureka.client.enabled=false
```

El puerto 18081 evita colisionar con el contenedor. Eureka se desactiva para esta instancia de demostración. En Postman:

```http
GET http://localhost:18081/api/equipamiento
```

Una respuesta 200 demuestra que el JAR arranca y atiende la consulta. Detener esta instancia con `Ctrl+C`; continuar el CRUD con Docker.

Este modo sirve para el JAR y sus operaciones propias. Los clientes Feign conservan nombres internos Docker: las recomendaciones y comunicaciones entre servicios deben probarse mediante Compose.

## 7. Inventario de endpoints

Las rutas `/api/...` están disponibles por el Gateway en el puerto 8080 o por el puerto directo de su servicio. Sustituir `{id}`, `{rutaId}` y `{dificultad}` por valores reales.

| Servicio | Método | Ruta |
| --- | --- | --- |
| Usuario | GET, POST | `/api/usuarios` |
| Usuario | GET, DELETE | `/api/usuarios/{id}` |
| Equipamiento | GET, POST | `/api/equipamiento` |
| Equipamiento | GET, PUT, DELETE | `/api/equipamiento/{id}` |
| Equipamiento | GET | `/api/equipamiento/disponibles` |
| Equipamiento | GET | `/api/equipamiento/dificultad/{dificultad}` |
| Equipamiento | GET | `/api/equipamiento/recomendacion/{rutaId}` |
| Equipamiento interno | GET | `/api/equipamiento/interno` |
| Equipamiento interno | GET | `/api/equipamiento/interno/disponibles` |
| Equipamiento interno | GET | `/api/equipamiento/interno/dificultad/{dificultad}` |
| Ruta | GET, POST | `/api/rutas` |
| Ruta | GET | `/api/rutas/{id}` |
| Ruta | GET | `/api/rutas/equipamientos` |
| Ruta | GET | `/api/rutas/equipamientos/disponibles` |
| Ruta | GET | `/api/rutas/{id}/equipamiento` |
| Ruta | GET | `/api/rutas/{id}/detalle` |
| Ruta | PUT | `/api/rutas/{id}/descontar-cupos?cantidad=1` |
| Ruta | PUT | `/api/rutas/{id}/aumentar-cupos?cantidad=1` |
| Reserva | GET, POST | `/api/reservas` |
| Reserva | GET, PUT, DELETE | `/api/reservas/{id}` |
| Reserva | PUT | `/api/reservas/{id}/confirmar-pago` |
| Pago | GET, POST | `/api/pagos` |
| Pago | GET, PUT, DELETE | `/api/pagos/{id}` |
| Pago | PUT | `/api/pagos/{id}/pagar` |
| Gateway | POST | `/auth/register`, `/auth/login` |

Usuario no tiene PUT; ruta no tiene DELETE ni actualización general. Utilizar equipamiento para demostrar CRUD completo.

Para crear reservas deben existir usuario y ruta, haber cupos y estar disponible el servicio de pagos. Si se incluyen equipamientos, deben existir y estar disponibles; su valor de arriendo se agrega al total según la cantidad solicitada. Usar los IDs devueltos por las APIs. La creación valida los datos, descuenta cupos, persiste la reserva y crea el pago; no constituye una transacción atómica entre microservicios.

## 8. CRUD reproducible con Postman y MySQL

### Preparación

Crear una colección con variable `baseUrl` igual a `http://localhost:8081`. Para pasar por el Gateway, usar `http://localhost:8080`. Para los cuerpos elegir **Body → raw → JSON**, con `Content-Type: application/json`.

En otra terminal, desde la carpeta de Compose:

```powershell
docker compose exec mysql mysql -u root
```

En MySQL:

```sql
SHOW DATABASES;
USE bd_equipamiento;
SHOW TABLES;
DESCRIBE equipamiento;
```

### Crear

`POST {{baseUrl}}/api/equipamiento`

```json
{
  "nombre": "Carpa demo video",
  "descripcion": "Carpa utilizada para demostrar el CRUD",
  "obligatorio": true,
  "capacidadPersonas": 2,
  "impermeable": true,
  "dificultad": "MEDIA",
  "disponible": true,
  "valorArriendo": 15000
}
```

Resultado esperado según el controlador: **200 OK**, datos del equipo, ID generado y enlaces HATEOAS. Este POST no configura 201.

Guardar el ID recibido como variable de colección `equipoId`. Opcionalmente, en **Scripts → Post-response**:

```javascript
pm.test("Creación responde 200", () => pm.response.to.have.status(200));
pm.collectionVariables.set("equipoId", pm.response.json().id);
```

Comprobar en MySQL:

```sql
SELECT * FROM equipamiento WHERE nombre = 'Carpa demo video';
```

### Leer

`GET {{baseUrl}}/api/equipamiento/{{equipoId}}`

Resultado esperado: **200 OK** con los mismos datos. Para listar: `GET {{baseUrl}}/api/equipamiento`.

En SQL, **reemplazar 12 por el ID real** recibido al crear:

```sql
SELECT * FROM equipamiento WHERE id = 12;
```

### Actualizar

`PUT {{baseUrl}}/api/equipamiento/{{equipoId}}`

Enviar todos los campos, porque el servicio los reemplaza:

```json
{
  "nombre": "Carpa demo video actualizada",
  "descripcion": "Carpa actualizada durante la presentacion",
  "obligatorio": true,
  "capacidadPersonas": 3,
  "impermeable": true,
  "dificultad": "MEDIA",
  "disponible": false,
  "valorArriendo": 18000
}
```

Resultado esperado: **200 OK**. Repetir la consulta del mismo ID y comprobar nombre, capacidad, disponibilidad y valor modificados.

### Eliminar

`DELETE {{baseUrl}}/api/equipamiento/{{equipoId}}`

Resultado esperado: **204 No Content**, sin cuerpo. Repetir la consulta SQL del mismo ID: debe devolver cero filas.

Salir de MySQL con `exit`.

### Manejo de errores

| Prueba | Resultado esperado en la implementación actual |
| --- | --- |
| POST de equipamiento con nombre vacío | 400 y mensaje de validación |
| POST con capacidad o valor de arriendo igual a 0 | 400 y mensajes de validación |
| GET del equipamiento ya eliminado | 400, con `mensaje: "Equipamiento no encontrado"` |
| GET de usuario inexistente | 404 |
| POST de usuario con email ya registrado | 409 |

Para validaciones, reutilizar el JSON completo cambiando solo el campo de prueba. Los códigos varían entre servicios: equipamiento devuelve actualmente 400 para recursos inexistentes. Estas son expectativas derivadas del código; durante la evaluación mostrar las respuestas reales.

## 9. Detener y diagnosticar

Desde la carpeta de Compose:

```powershell
docker compose logs --tail 100 ms-equipamiento
docker compose logs --tail 100 mysql
docker compose stop
```

`docker compose start` reanuda los contenedores existentes. Para retirar contenedores y red conservando los datos:

```powershell
docker compose down
```

El volumen `mysql_data` conserva los datos entre arranques. No añadir `-v` si se quieren conservar.

| Problema | Revisión |
| --- | --- |
| Docker no conecta | Abrir Docker Desktop, esperar su inicio y comprobar `docker info` |
| Puerto ocupado | Revisar otras aplicaciones o despliegues que lo utilicen |
| MySQL rechaza conexión | Revisar logs y credenciales; un volumen anterior conserva su configuración original |
| `mysql` o `eureka` no resuelve desde Windows | Usar `localhost` como en la sección 6 |
| Java incorrecto | Revisar `java -version`, `JAVA_HOME` y `.\mvnw.cmd -v`; se requiere JDK 21 |
| Fallan descargas Maven | Revisar conexión y mensajes de resolución de dependencias |
| No aparece el JAR | Verificar `BUILD SUCCESS` y que Maven se ejecutó dentro del módulo |
| Nombre de contenedor ocupado | Revisar `docker ps -a`; Compose usa nombres fijos y no admite dos copias simultáneas sin ajustes |

La advertencia de Compose sobre `version: "3.8"` obsoleto no constituye por sí sola un fallo.

## 10. Git y trazabilidad

La pauta pide `main`, `develop` y `feature/`, además de commits descriptivos. Es un requisito del historial real: mencionarlo en el README no acredita su uso.

```powershell
git branch -a
git log --oneline --graph --all -15
```

Flujo recomendado para próximos cambios: `feature/<descripcion>` desde `develop`, revisión e integración en `develop`, y versiones estables en `main`. Acordar el flujo entre ambos integrantes antes de reorganizar ramas. Tras actualizar las referencias remotas, se observaron `main` y ramas de trabajo como `rama_final`, `rama_franco`, `rama_magda`, `rama_micho`, `version_M` y `v_magda`; revisar su correspondencia con el flujo solicitado por la pauta.

## 11. Evidencias para la evaluación

| Indicador | Evidencia |
| --- | --- |
| IE1 / IE2 | Controladores, endpoints y estructura por capas |
| IE3 | Postman con respuestas correctas y errores; repartir entre ambos los endpoints del inventario |
| IE4 | Propiedades JDBC, dependencias JPA/MySQL y consultas reales |
| IE5 | Entidad, repositorio, controlador y CRUD completo con resultados SQL |
| IE6 | Mapeo existente y revisión pendiente de relaciones según la pauta |
| IE7 / IE8 | POM, Maven con pruebas, reportes, `BUILD SUCCESS` y JAR ejecutándose |
| IE9 | Ramas y commits reales; revisar el flujo pendiente |
| IE10 | Clonación, dependencias, ejecución y pruebas siguiendo este README |
| IE11 / IE12 | Introducción, desarrollo y cierre, lenguaje técnico, voz de ambos y audio claro |

El video completo de la pareja debe durar **entre 3 y 8 minutos**, en MP4 o formato similar. No es obligatorio aparecer en cámara. Recortar esperas manteniendo visibles comandos y resultados, sin ocultar fallos ni simular ejecuciones.

Entregar enlaces GitHub y video por los canales y en los plazos indicados por el docente. Este README describe el código revisado; no certifica por sí solo que una compilación, prueba o ejecución haya finalizado correctamente.
