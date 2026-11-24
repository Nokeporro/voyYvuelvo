# Voy y Vuelvo

Aplicación de rutas de trekking, reservas, arriendo de equipamiento y pagos.

## Tecnologías

Java 25, Spring Boot, MySQL, Eureka, Spring Cloud Gateway, JWT, React, Docker, Docker Swarm, GitHub Actions y AWS.

## Ejecución local

Requisitos: Docker Desktop (contenedores Linux) y Python 3. Desde la raíz:

```powershell
python scripts/init-env.py
docker compose --env-file voyYvuelvo/.env -f voyYvuelvo/docker-compose.yml up -d --build
docker compose --env-file voyYvuelvo/.env -f voyYvuelvo/docker-compose.yml ps
```

- Web: http://localhost:5173
- Gateway: http://localhost:8080
- Swagger: http://localhost:8080/swagger-ui.html
- Eureka: http://localhost:8761

Para comprobar los endpoints:

```powershell
python scripts/smoke.py
python scripts/smoke.py --e2e
```

La segunda prueba crea una cuenta, perfil y reserva de prueba y ocupa un cupo. En local, `SQS_QUEUE_URL` puede quedar vacío. No subir el archivo `.env`.

Para crear un administrador de prueba, registrar una cuenta y actualizar su rol en MySQL:

```powershell
docker compose --env-file voyYvuelvo/.env -f voyYvuelvo/docker-compose.yml exec mysql mysql -u voyapp -p bd_gateway
```

```sql
UPDATE usuarios SET rol='ADMINISTRADOR' WHERE username='usuario_de_prueba';
```

Volver a iniciar sesión para obtener el nuevo token. Para detener el proyecto sin borrar los datos:

```powershell
docker compose --env-file voyYvuelvo/.env -f voyYvuelvo/docker-compose.yml down
```

## Pruebas

```bash
mvn -B -f voyYvuelvo/pom.xml clean verify
cd frontend
npm ci
npm test
npm run build
cd ..
python -m unittest discover -s serverless -v
```

## Fase actual: validación local en rama_JAVA

AWS y el video están aplazados. Los archivos cloud previos se conservan, pero el pipeline no publica imágenes ni ejecuta provisión o despliegue. No se necesitan credenciales AWS o Docker Hub para ejecutar las pruebas actuales.

Usa JDK 25 para Maven. Comprueba `java -version` y `JAVA_HOME`; si Windows selecciona otra versión, configura `JAVA_HOME` solo en la terminal de trabajo con la ruta real de tu JDK 25. Desde la raíz:

```powershell
.\voyYvuelvo\mvnw.cmd -v
.\voyYvuelvo\mvnw.cmd -B -ntp -f voyYvuelvo/pom.xml clean verify
python -m unittest discover -s serverless -v
npm.cmd --prefix frontend test -- --maxWorkers=2
npm.cmd --prefix frontend run build
```

Las pruebas Java usan su configuración de test; las pruebas Python usan servicios simulados. No acreditan una ejecución real en AWS. Para validar Docker sin iniciar contenedores, después de generar la configuración local con `scripts/init-env.py`:

```powershell
docker compose --env-file voyYvuelvo/.env -f voyYvuelvo/docker-compose.yml config --quiet
```

El workflow también comprueba la definición Swarm con valores de validación y revisa la sintaxis de los scripts Bash. Eso comprueba la configuración, pero no sustituye la ejecución en un clúster con nodos manager y worker. Docker Desktop debe estar iniciado para las comprobaciones de contenedores y endpoints descritas en Ejecución local.

## Docker Swarm en AWS (fase aplazada)

Crear dos instancias EC2 Ubuntu 24.04 x86_64 en la misma VPC, con memoria suficiente para los contenedores (por ejemplo, 4 GB por nodo). Permitir TCP 2377, TCP/UDP 7946 y UDP 4789 solamente entre los nodos. Restringir SSH y HTTP a las IP autorizadas. No publicar los puertos internos de MySQL, Eureka ni los microservicios.

Las dos instancias necesitan acceso a Docker Hub y un perfil IAM con permiso `sqs:SendMessage` para la cola. Configurar IMDSv2 obligatorio y hop limit 2 para el acceso al perfil desde el contenedor. Copiar los scripts `install-docker.sh`, `swarm-init.sh` y `swarm-worker.sh` a las instancias.

En ambas instancias:

```bash
bash install-docker.sh
```

Volver a conectarse por SSH para aplicar los permisos de Docker. En el manager:

```bash
bash swarm-init.sh IP_PRIVADA_MANAGER
```

En el worker:

```bash
bash swarm-worker.sh IP_PRIVADA_MANAGER
```

Introducir el token que entrega el manager. No compartirlo. Verificar desde el manager:

```bash
docker node ls
```

El archivo `voyYvuelvo/docker-compose.swarm.yml` define las imágenes, redes, réplicas y volumen de MySQL. MySQL se mantiene en el nodo etiquetado por `swarm-init.sh`.

## GitHub Actions

La fase actual se desarrolla exclusivamente en `rama_JAVA`: pruebas de Java, frontend y función existente, validación de configuración Docker y construcción de imágenes sin publicarlas. AWS y la preparación del video están aplazados. El job cloud está desactivado expresamente; no se necesitan credenciales AWS ni Docker Hub para esta fase.

### Configuración cloud pendiente (no necesaria para las pruebas actuales)

Crear un repositorio de imágenes `voyvuelvo-ep3` en Docker Hub. En GitHub, Settings > Secrets and variables > Actions, configurar:

| Variables | Valor |
|---|---|
| DOCKERHUB_USER | Usuario de Docker Hub |
| CLOUD_ENABLED | `true` cuando AWS esté configurado |
| AWS_REGION | Región de AWS, por ejemplo `us-east-1` |
| CLOUD_STACK | `voyvuelvo-ep3` |
| SSH_USER | `ubuntu` |
| APP_CORS_ORIGINS | Origen HTTP de la web de prueba |
| SSH_SECURITY_GROUP | ID del grupo de seguridad para acceso temporal SSH (opcional) |
| LAMBDA_ROLE_ARN | ARN del rol Lambda existente, si corresponde |
| PUBLISHER_ROLE_NAME | Nombre del rol EC2 existente, si corresponde |

| Secrets | Valor |
|---|---|
| DOCKERHUB_TOKEN | Token de publicación de Docker Hub |
| DOCKERHUB_READ_TOKEN | Token de lectura para desplegar (opcional) |
| AWS_ACCESS_KEY_ID | Credencial AWS |
| AWS_SECRET_ACCESS_KEY | Clave AWS |
| AWS_SESSION_TOKEN | Token de sesión, si corresponde |
| SSH_HOST | IP pública o DNS del manager |
| SSH_PRIVATE_KEY | Llave privada SSH |
| SSH_KNOWN_HOSTS | Huella SSH del manager verificada |
| DB_ROOT_PASSWORD | Contraseña MySQL root |
| DB_PASSWORD | Contraseña MySQL de aplicación |
| JWT_SECRET_BASE64 | Clave aleatoria de al menos 32 bytes en Base64 |

Las contraseñas y la clave JWT pueden generarse con `python scripts/init-env.py` en una copia separada para cloud. No reutilizar claves locales. Verificar la huella SSH por un canal confiable. El runner debe tener acceso SSH al manager: usar `SSH_SECURITY_GROUP` con permisos de autorización y revocación de reglas EC2, o un runner autorizado con IP fija. No abrir SSH a todo Internet.

El workflow `.github/workflows/ci-cd.yml` se activa con un push a `rama_JAVA` o un pull request dirigido a esa rama. Actualmente ejecuta pruebas y construye imágenes, sin publicación ni despliegue. El job cloud no se activa ni siquiera con `CLOUD_ENABLED=true`; requiere una fase posterior autorizada de configuración y habilitación. Las credenciales AWS deben tener permisos sobre CloudFormation y sus recursos, incluyendo `iam:PassRole` si corresponde. Si se utiliza un rol Lambda existente, debe permitir recibir y eliminar mensajes SQS, escribir en DynamoDB y publicar logs.

## Confirmación de reservas

`SqsPublisher.java` envía el evento `RESERVA_CREADA` después de guardar una reserva. `serverless/handler.py` consume los mensajes y guarda una confirmación de registro en DynamoDB. No confirma el pago ni envía correos. CloudWatch registra los identificadores de los eventos. Los mensajes que agotan los reintentos pasan a la DLQ. Si falla la publicación inicial, se registra el error en el backend.

El template `cloud/template.yaml` y `scripts/provision.sh` configuran la cola, la función Lambda, DynamoDB y CloudWatch. El pipeline llama al script de provisión. También se puede ejecutar con AWS CLI configurada:

```bash
export AWS_REGION=us-east-1 CLOUD_STACK=voyvuelvo-ep3
bash scripts/provision.sh
```

Configurar `LAMBDA_ROLE_ARN` y `PUBLISHER_ROLE_NAME` si el laboratorio usa roles existentes. Si se omiten, el rol Lambda se crea en CloudFormation y el perfil EC2 debe tener permiso de publicación por separado.

## Verificación cloud

En el manager:

```bash
docker stack services voyvuelvo
docker service ps voyvuelvo_ms-ruta
docker service scale voyvuelvo_ms-ruta=2
docker service ps voyvuelvo_ms-ruta
curl -fsS http://127.0.0.1/backend/api/rutas
docker service scale voyvuelvo_ms-ruta=1
```

Desde el computador:

```powershell
python scripts/smoke.py --base http://IP_PUBLICA_MANAGER/backend
python scripts/smoke.py --base http://IP_PUBLICA_MANAGER/backend --e2e
```

Consultar la reserva creada en DynamoDB y sus logs en CloudWatch. Los nombres y URL de los recursos se obtienen desde los Outputs del stack CloudFormation. El Gateway de Spring protege las rutas con JWT y roles. HTTP se utiliza únicamente para la demostración con datos ficticios y acceso restringido; en producción se requiere HTTPS.

El clúster tiene un manager y un worker; permite escalar servicios sin estado, pero MySQL y el manager no son redundantes. AWS puede generar cargos. Al finalizar, detener el stack (`docker stack rm voyvuelvo`) y revisar en AWS las instancias, discos y recursos que ya no se necesitan.
