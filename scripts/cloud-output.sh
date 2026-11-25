#!/usr/bin/env bash
set -euo pipefail
key=${1:?Indique QueueUrl, QueueArn, TableName o FunctionName}
aws cloudformation describe-stacks --region "${AWS_REGION:-us-east-1}" \
  --stack-name "${CLOUD_STACK:-voyvuelvo-ep3}" \
  --query "Stacks[0].Outputs[?OutputKey=='$key'].OutputValue | [0]" --output text
