#!/usr/bin/env bash
# Render the chart, check it against the policies and the Checkov ruleset, then
# prove the policies still bite by running them against a deliberately bad
# manifest. CI runs the same checks; keep the two in step.
set -euo pipefail
cd "$(dirname "$0")/.."
out=$(mktemp -d)
trap 'rm -rf "$out"' EXIT

# The namespace matches what Argo CD renders with, so the manifests are checked
# in the shape they are actually deployed in.
NAMESPACE=${NAMESPACE:-template-preview}

helm lint k8s/chart -f k8s/chart/values-small.yaml
helm template preview k8s/chart -f k8s/chart/values-small.yaml \
  --namespace "$NAMESPACE" \
  --set images.web.tag=abc1234 --set images.api.tag=abc1234 > "$out/rendered.yaml"

kyverno apply k8s/policies --resource "$out/rendered.yaml"

if command -v checkov >/dev/null 2>&1; then
  checkov -f "$out/rendered.yaml" --framework kubernetes --compact --quiet
  checkov -d . --framework dockerfile --compact --quiet
else
  echo "checkov not installed; skipping (CI runs it)" >&2
fi

cat > "$out/bad.yaml" <<'BAD'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: bad
spec:
  selector:
    matchLabels:
      app: bad
  template:
    metadata:
      labels:
        app: bad
    spec:
      containers:
        - name: bad
          image: nginx:latest
          securityContext:
            privileged: true
BAD
if kyverno apply k8s/policies --resource "$out/bad.yaml" >/dev/null 2>&1; then
  echo "policies did not reject the bad manifest" >&2
  exit 1
fi
echo "manifests ok; policies reject a bad manifest"
