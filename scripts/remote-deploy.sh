#!/usr/bin/env bash
# Runner GitHub -> manager EC2; no imprimir claves.
set -euo pipefail
cd "$(dirname "$0")/.."
: "${SSH_HOST:?Falta SSH_HOST}" "${SSH_USER:?Falta SSH_USER}" "${DB_PASSWORD:?Falta DB_PASSWORD}" "${DB_ROOT_PASSWORD:?Falta DB_ROOT_PASSWORD}" "${JWT_SECRET_BASE64:?Falta JWT_SECRET_BASE64}" "${REGISTRY_TOKEN:?Falta token}"
[[ "$SSH_HOST" =~ ^[a-zA-Z0-9.-]+$ && "$SSH_USER" =~ ^[a-zA-Z0-9_-]+$ ]]
[[ $(printf %s "$JWT_SECRET_BASE64" | base64 -d | wc -c) -ge 32 ]]
remote="$SSH_USER@$SSH_HOST"
registry_user=${REGISTRY_USER:?Falta DOCKERHUB_USER}
[[ "$registry_user" =~ ^[a-zA-Z0-9_-]+$ ]]
sshopt=(-o BatchMode=yes -o StrictHostKeyChecking=yes -o ConnectTimeout=20)
queue=$(bash scripts/cloud-output.sh QueueUrl)
[[ "$queue" == https://* ]]
for pair in 'db_password DB_PASSWORD' 'db_root_password DB_ROOT_PASSWORD' 'jwt_secret JWT_SECRET_BASE64'; do
  read -r name var <<< "$pair"
  printf '%s' "${!var}" | ssh "${sshopt[@]}" "$remote" "docker secret inspect voyvuelvo_$name >/dev/null 2>&1 || docker secret create voyvuelvo_$name - >/dev/null"
done
printf '%s' "$REGISTRY_TOKEN" | ssh "${sshopt[@]}" "$remote" "docker login -u '$registry_user' --password-stdin"
trap 'ssh "${sshopt[@]}" "$remote" "docker logout" >/dev/null 2>&1 || true' EXIT
ssh "${sshopt[@]}" "$remote" 'mkdir -p ~/voyvuelvo-ep3/scripts ~/voyvuelvo-ep3/voyYvuelvo'
scp "${sshopt[@]}" scripts/deploy.sh "$remote:~/voyvuelvo-ep3/scripts/deploy.sh"
scp "${sshopt[@]}" voyYvuelvo/docker-compose.swarm.yml "$remote:~/voyvuelvo-ep3/voyYvuelvo/docker-compose.swarm.yml"
printf -v args '%q ' "docker.io/$registry_user/voyvuelvo-ep3" "$GITHUB_SHA" "$queue" "$AWS_REGION" "$APP_CORS_ORIGINS"
ssh "${sshopt[@]}" "$remote" "bash ~/voyvuelvo-ep3/scripts/deploy.sh $args"

scp "${sshopt[@]}" scripts/smoke.py "$remote:~/voyvuelvo-ep3/scripts/smoke.py"
ssh "${sshopt[@]}" "$remote" 'python3 ~/voyvuelvo-ep3/scripts/smoke.py --base http://127.0.0.1/backend'
