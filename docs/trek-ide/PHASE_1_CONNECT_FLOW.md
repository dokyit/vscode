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
- Connection remains mock-mode (`accountLabel: mock-account`) to validate UX/control flow before provider adapters are wired.
- Unsupported providers are blocked with explicit reason.
- Added disconnect command and storage refresh path.

## Next implementation

1. Add provider-specific auth adapters:
   - Copilot device flow
   - OpenAI web flow
   - Gemini cloud IAM
2. Add secure token storage bridge.
3. Replace mock connect with real token + entitlement checks.
