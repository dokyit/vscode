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

- Sessions are profile-scoped and persisted to storage key `trek.auth.sessions.v1`.
- Connection now routes through provider adapter registry.
- Copilot device-flow adapter scaffold is wired as the first provider adapter.
- Unsupported providers are blocked with explicit reason.
- Added disconnect command and storage refresh path.

## Next implementation

1. Add real OAuth/device handshake in Copilot adapter (replace scaffold prompt).
2. Add OpenAI and Gemini adapter implementations.
3. Add secure token storage bridge.
4. Add entitlement verification endpoints per provider.
