{{- define "app.labels" -}}
app.kubernetes.io/name: {{ .Chart.Name }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{/*
Checkov findings this chart accepts, with the reason. These are exceptions the
scan still reports by name; the gate itself stays hard (soft_fail is never set).
*/}}
{{- define "app.acceptedFindings" -}}
checkov.io/skip1: CKV_K8S_43=Images are pinned to the immutable git-sha tag CI commits into values.yaml; a floating tag is what the Kyverno policy forbids.
checkov.io/skip2: CKV_K8S_40=Containers run as their image's own non-root user (node 1000, postgres 70). runAsNonRoot, dropped capabilities, seccomp and a read-only root filesystem are the controls.
checkov.io/skip3: CKV_K8S_35=Database credentials reach the process as environment variables, which is what the Postgres client and the migration tool read.
{{- end -}}
