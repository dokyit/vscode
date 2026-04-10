# Trek IDE Phase 1 Connect Flow (Scaffold)

This phase introduces command-level scaffolding for provider connection flows.

## Commands added

- `trek.auth.showProviderCapabilities`
  - Displays capability matrix from broker.
- `trek.auth.connectProvider`
  - Select provider -> select supported method -> create mock session.
- `trek.auth.showSessions`
  - Displays active sessions in quick pick.

## Current behavior

- Sessions are in-memory only (no persistence yet).
- Connection is mock-mode (`accountLabel: mock-account`) to validate UX/control flow.
- Unsupported providers are blocked with explicit reason.

## Next implementation

1. Persist sessions per-profile using storage service.
2. Add provider-specific auth adapters:
   - Copilot device flow
   - OpenAI web flow
   - Gemini cloud IAM
3. Add secure token storage bridge.
4. Replace mock connect with real token + entitlement checks.
