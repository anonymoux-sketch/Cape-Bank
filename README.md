# CAPE BANK — Local Demo Prototype

## Run with VS Code Live Server

1. Extract this folder.
2. Open it in VS Code.
3. Install/use the **Live Server** extension.
4. Right-click `index.html` → **Open with Live Server**.
5. The browser will open the CAPE BANK demo.

## Included behavior

- Mobile-responsive CAPE BANK dashboard.
- Demo sign-in screen.
- Available balance and demo account details.
- Recent activity.
- Transfer form.
- Simulated transfer error `CB-DEMO-403`.
- The error modal exposes editable demo username and amount fields.
- No real transfer is performed.
- No credentials, bank APIs, payment rails, or real account data are used.

## Important for a real banking product

This is a UI/testing prototype, not production banking software. A production system needs a real backend, secure authentication/MFA, authorization, transaction signing, fraud controls, audit logging, encrypted transport/storage, rate limiting, monitoring, regulatory/compliance review, and penetration testing. Never put secrets or authentication tokens in browser storage or client-side JavaScript.
