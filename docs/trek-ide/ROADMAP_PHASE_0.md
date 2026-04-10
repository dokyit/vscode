# Trek IDE Roadmap - Phase 0

Phase 0 objective: establish product identity and auth architecture scaffolding without destabilizing upstream sync.

## Completed in this branch

- Product rename baseline to Trek IDE in `product.json` and dev fallback product config.
- Fork README preface added for Trek IDE identity.
- Initial provider auth capability matrix added.

## Next tasks

1. Add provider auth broker interfaces in a dedicated Trek namespace.
2. Add settings schema for provider capability metadata and selected auth method.
3. Add Connect UI stub in workbench with provider method cards.
4. Add secure token storage adapter abstraction (Windows/macOS/Linux).
5. Add entitlement check adapters (Copilot, OpenAI, GitLab first).

## Guardrails

- Keep Trek-specific changes isolated under `docs/trek-ide` and a dedicated `src/vs/workbench/contrib/trek` path when code starts.
- Avoid broad string-replace renames across the full repo in early phases.
- Preserve clean rebase path with upstream `main`.
