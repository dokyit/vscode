# Trek IDE Auth Provider Capabilities

This document defines the initial auth capability matrix for Trek IDE.

Goal: support account sign-in (non-API key) where providers officially permit it, and otherwise fall back to API key / cloud IAM methods.

## Capability Keys

- `api_key`: User pastes API key/token.
- `oauth_device`: Device code flow.
- `oauth_web`: Browser OAuth flow.
- `cloud_iam`: Cloud credential chain (ADC/AWS/etc).
- `unsupported`: Not available in Trek IDE for policy/legal reasons.

## Initial Matrix

- GitHub Copilot
  - `oauth_device`
  - Notes: subscription entitlement gates model access.

- OpenAI (ChatGPT)
  - `oauth_web` (for account-based ChatGPT Plus/Pro flows where supported)
  - `api_key`

- Gemini
  - `cloud_iam`
  - `api_key` (where provider path supports key-based access)
  - Notes: no assumed consumer "Gemini Advanced" account-login flow for third-party IDE routing.

- Claude (Anthropic)
  - `api_key`
  - `unsupported` for subscription account routing in Trek IDE unless official provider policy changes.

- T3 Chat
  - `unsupported` for direct provider auth until official third-party model-routing auth docs exist.

## UX Rules

- Provider picker must only show methods listed for that provider.
- If user asks for unsupported method, explain why and provide nearest supported option.
- Persist tokens in OS credential store only.
