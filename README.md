# app-template-web-api-postgres

Paved-road template for the `web-api-postgres` archetype: a Next.js web app, a Fastify API, Postgres, a Helm chart with per-tier values, Kyverno policies, and gated CI. Generated projects start as a copy of this repository.

Local: `docker compose up -d --build`, then open http://localhost:3000. Tests: see AGENTS.md.

## Local ports

| Service  | Host | In the compose network, CI and the cluster |
|----------|------|--------------------------------------------|
| web      | 3000 | 3000 |
| api      | 3001 | 3001 |
| postgres | 5433 | 5432 |

Postgres is published on 5433 because a developer machine often already runs
Postgres on 5432. Nothing inside the stack sees 5433: the API connects to
`postgres:5432`, and CI and the cluster use 5432 as usual. Host-side unit tests
default to `postgres://app:app@localhost:5433/app`; override with `DATABASE_URL`.

## Versions

Pinned at first build, 14 September 2026:

- Node 22 (containers and CI), npm workspaces
- Next.js 16.3.5, React 19.2.8
- Fastify 5.12.4, pg 8.23.0, node-pg-migrate 9.0.0
- TypeScript 7.0.2 (api), 5.x (web), Vitest 3.2.7, Playwright 1.63.0
- @anthropic-ai/sdk 0.127.0 (api), used only through `api/src/ai.ts`

## AI calls

Anything the app asks a model goes through `ask()` in `api/src/ai.ts`, which talks to the builder's
door guard (`AI_BASE_URL`) with the session's token (`AI_TOKEN`); the guard holds the real key, so no
credential ever lives in this repository or in a preview namespace. With `AI_BASE_URL` unset - CI, or
a laptop without a guard - `ask()` returns a marked stand-in answer so the suites still run.

AGENTS.md stays at nine numbered lines.

## Lockfiles

The workspace root holds one `package-lock.json` for `npm ci` in CI. `api/` and
`web/` each keep a standalone lockfile as well, because their images are built
with the package directory as the Docker build context. Regenerate both after
changing any dependency:

```
npm run lock:packages
```

## Known advisories

- `@vitest/mocker` (GHSA-82fw-gwwq-j7x9, moderate): affects Vitest 2.1.0–4.1.10
  with no fixed forward release. Vitest is a dev dependency and is not present in
  either runtime image. Below the CRITICAL/HIGH threshold the CI scan gates on.
  Revisit when a patched 3.x is published.

## Policy and scanning

`npm run lint:manifests` renders the chart into the namespace Argo CD deploys it
to, checks it against `k8s/policies`, runs Checkov over the rendered manifests
and both Dockerfiles, and finally proves the policies still bite by running them
against a deliberately bad manifest. CI runs the same checks.

The policies are `policies.kyverno.io/v1 ValidatingPolicy` (CEL), not
`kyverno.io/v1 ClusterPolicy`: Kyverno 1.19 deprecates ClusterPolicy and removes
it in 1.20.

Three Checkov findings are accepted rather than fixed, and each workload carries
the reason as a `checkov.io/skip` annotation, so the exception travels with the
manifest and the gate itself stays hard (`soft_fail` is never set):

| Finding | Why it is accepted |
|---------|--------------------|
| CKV_K8S_43 image should use digest | Images are pinned to the immutable git-sha tag CI commits into `values.yaml`. A floating tag is what the Kyverno policy forbids. |
| CKV_K8S_40 high UID | Containers run as their image's own non-root user (node 1000, postgres 70). `runAsNonRoot`, dropped capabilities, seccomp and a read-only root filesystem are the controls. |
| CKV_K8S_35 secrets as files | Database credentials reach the process as environment variables, which is what the Postgres client and the migration tool read. |

## CI notes

- Runtime images drop npm (`rm -rf /usr/local/lib/node_modules/npm ...`) and run
  `apk upgrade --no-cache`. Without both, the image scan fails on CRITICAL/HIGH
  findings that come from the base image rather than from this code: npm's
  bundled `tar`, and an OpenSSL fix the `node:22-alpine` build lags behind.
  Nothing at runtime needs a package manager — the migration Job and compose
  both call `node node_modules/.bin/node-pg-migrate` directly.
- `aquasecurity/trivy-action` is pinned to `v0.36.0`; the action's tags are
  `v`-prefixed.
- `kyverno/action-install-cli` is pinned to `release: v1.19.1`. The action
  defaults to v1.10.3, which predates the `ValidatingPolicy` type these policies
  use, so the CI check would fail to load them.
- The release workflow pushes the image-tag commit as an installed **GitHub
  App**, not as `github-actions[bot]`. A ruleset can only name an installed app
  as a bypass actor; GitHub Actions is a platform feature rather than an
  installed app, so it can never appear in that list. The app needs
  `Contents: read and write`, an org-wide installation, and two org secrets:
  `RELEASE_APP_ID` and `RELEASE_APP_PRIVATE_KEY`. Because the secrets live at
  the org, every repository the builder creates inherits them with no per-repo
  setup.
- Release images are built for `linux/amd64,linux/arm64`. A single-arch amd64
  image fails to pull on an arm64 node with `no match for platform in manifest`,
  which is what a developer machine and the local kind cluster are. Pull-request
  builds stay single-arch: they only prove the image builds and scan it.
