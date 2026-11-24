#!/usr/bin/env bash
# En el manager, usando la IP PRIVADA de la instancia.
set -euo pipefail
ip=${1:?Uso: bash scripts/swarm-init.sh IP_PRIVADA_MANAGER}
if [[ $(docker info --format '{{.Swarm.LocalNodeState}}') != active ]]; then
  docker swarm init --advertise-addr "$ip"
fi
[[ $(docker info --format '{{.Swarm.ControlAvailable}}') == true ]]
docker node update --label-add voydb=true "$(docker info --format '{{.Swarm.NodeID}}')"
echo 'Ejecute el siguiente comando en el worker. No grabe ni publique el token:'
docker swarm join-token worker
