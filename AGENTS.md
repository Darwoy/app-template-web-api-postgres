# How to work in this repository
1. The product spec is in specs/: brief.md (what and for whom), scenarios.yaml (checks S-n), rules.yaml (rules R-n), placement.yaml (archetype and tier).
2. Code lives in api/ (Fastify + Postgres) and web/ (Next.js). Kubernetes manifests come only from k8s/chart; never hand-write manifests elsewhere.
3. Run unit tests with `npm test`. They need Postgres: `docker compose up -d postgres` first.
4. Run the scenario suite with `docker compose up -d --build && npm run scenarios`; one file per scenario id in tests/scenarios/.
5. Run rule tests with `npm run rules`; one file per rule id in tests/rules/.
6. A change is done when: unit tests pass, every scenario and rule test passes, `npm run lint:manifests` passes, and the pull-request checks are green.
7. Never run kubectl, helm install, helm upgrade or docker push. Deployment happens by merge; the cluster pulls.
8. Add a scenario test for every new scenario id before implementing it. Add a rule test for every new rule id.
9. Keep AGENTS.md at ten lines.
