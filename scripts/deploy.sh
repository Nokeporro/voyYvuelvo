#!/usr/bin/env bash
# Ejecutar EN EL MANAGER. Las imágenes deben estar disponibles en Docker Hub.
set -euo pipefail
export IMAGE_PREFIX=${1:?Prefijo de imágenes}
export IMAGE_TAG=${2:?Tag SHA}
export SQS_QUEUE_URL=${3:?URL SQS}
export AWS_REGION=${4:-us-east-1}
export APP_CORS_ORIGINS=${5:-http://localhost:5173,http://127.0.0.1:5173}
stack=${STACK_NAME:-voyvuelvo}
cd "$(dirname "$0")/.."
[[ $(docker info --format '{{.Swarm.ControlAvailable}}') == true ]]
[[ $(docker node ls --format '{{.Status}}' | grep -cx Ready || true) -ge 2 ]] || { echo 'Se requieren 2 nodos Ready'; exit 1; }
for secret in db_password db_root_password jwt_secret; do
  docker secret inspect "voyvuelvo_$secret" >/dev/null
 done
docker stack config -c voyYvuelvo/docker-compose.swarm.yml >/dev/null
docker stack deploy --with-registry-auth -c voyYvuelvo/docker-compose.swarm.yml "$stack"
# docker stack deploy no espera convergencia; comprobar estado y versión real.
services=(mysql eureka api-gateway ms-usuario ms-equipamiento ms-ruta ms-reserva ms-pago frontend)
for attempt in $(seq 1 100); do
  ready=1
  for name in "${services[@]}"; do
    service="${stack}_${name}"
    image=$(docker service inspect --format '{{.Spec.TaskTemplate.ContainerSpec.Image}}' "$service" 2>/dev/null || true)
    expected="${IMAGE_PREFIX#docker.io/}:$name-$IMAGE_TAG"
    actual="${image#docker.io/}"
    [[ "$actual" == "$expected" || "$actual" == "$expected@"* ]] || ready=0
    state=$(docker service inspect --format '{{if .UpdateStatus}}{{.UpdateStatus.State}}{{else}}none{{end}}' "$service" 2>/dev/null || true)
    [[ "$state" == none || "$state" == completed ]] || ready=0
    replicas=$(docker service ls --filter "name=$service" --format '{{.Replicas}}')
    [[ "$replicas" =~ ^([0-9]+)/([0-9]+)$ ]] && [[ ${BASH_REMATCH[1]} == "${BASH_REMATCH[2]}" && ${BASH_REMATCH[1]} != 0 ]] || ready=0
  done
  if [[ $ready == 1 ]] && curl -fsS --max-time 5 http://127.0.0.1/healthz >/dev/null && curl -fsS --max-time 5 http://127.0.0.1/backend/api/rutas >/dev/null; then
    docker stack services "$stack"
    exit 0
  fi
  sleep 10
done
docker stack services "$stack"
docker stack ps --no-trunc "$stack"
echo 'No se verificó el despliegue completo de la versión esperada.' >&2
exit 1
