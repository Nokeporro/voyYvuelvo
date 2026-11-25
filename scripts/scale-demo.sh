#!/usr/bin/env bash
# Ejecutar en manager. Escala ms-ruta y comprueba respuesta durante el cambio.
set -euo pipefail
service=${STACK_NAME:-voyvuelvo}_ms-ruta
url=${BASE_URL:-http://127.0.0.1/backend/api/rutas}
wait_replicas() {
  local expected=$1
  for i in $(seq 1 60); do
    curl -fsS --max-time 5 "$url" >/dev/null || { echo 'Endpoint no respondió durante el escalado'; return 1; }
    replicas=$(docker service ls --filter "name=$service" --format '{{.Replicas}}')
    echo "Réplicas: $replicas; endpoint HTTP OK"
    [[ "$replicas" == "$expected/$expected" ]] && return 0
    sleep 3
  done
  echo 'No se alcanzaron las réplicas solicitadas' >&2
  return 1
}
docker service scale --detach=true "$service=2"
wait_replicas 2
docker service ps "$service" --filter desired-state=running
docker service scale --detach=true "$service=1"
wait_replicas 1
