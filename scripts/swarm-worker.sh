#!/usr/bin/env bash
set -euo pipefail
manager=${1:?Uso: bash scripts/swarm-worker.sh IP_PRIVADA_MANAGER}
read -rsp 'Token de worker: ' token; echo
docker swarm join --token "$token" "$manager:2377"
