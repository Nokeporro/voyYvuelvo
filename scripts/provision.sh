#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
: "${AWS_REGION:=us-east-1}"
: "${CLOUD_STACK:=voyvuelvo-ep3}"
export AWS_REGION AWS_DEFAULT_REGION="$AWS_REGION"
template=$(mktemp)
trap 'rm -f "$template"' EXIT
python3 scripts/render-template.py > "$template"
aws cloudformation deploy --template-file "$template" --stack-name "$CLOUD_STACK" \
  --capabilities CAPABILITY_IAM --no-fail-on-empty-changeset \
  --parameter-overrides "ExistingLambdaRoleArn=${LAMBDA_ROLE_ARN:-}" "PublisherRoleName=${PUBLISHER_ROLE_NAME:-}"
