# CAPE BANK — Cross-Device Mobile Prototype

This is the revised CAPE BANK project with the approved mobile layout, color-coded sections, animations, CAPE BANK logo, a fixed password Show/Hide control, and a separate Node API for cross-device account login testing.

## Project structure

```text
CAPE-BANK-cross-device-v1/
├── public/
│   ├── index.html
│   ├── config.js
│   ├── manifest.json
│   ├── sw.js
│   ├── css/styles.css
│   └── js/app.js
├── api/
│   ├── app.js
│   ├── server.js
│   ├── lib/
│   │   ├── db.js
│   │   └── middleware.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── profile.js
│   │   ├── account.js
│   │   ├── notifications.js
│   │   ├── bills.js
│   │   └── transfers.js
│   └── data/
│       └── db.json       # created automatically after first signup
├── package.json
├── .env.example
└── README.md
```

## 1. Install the API

Install Node.js 18+.

In VS Code, open the project folder and run:

```bash
npm install
```

Create `.env` from `.env.example` and set a long random `JWT_SECRET`.

```env
NODE_ENV=development
PORT=4000
HOST=0.0.0.0
JWT_SECRET=put-a-long-random-secret-here
```

## 2. Start the complete app

```bash
npm start
```

Open:

```text
http://localhost:4000
```

The included Node server serves both the frontend and `/api/*`, so `public/config.js` can remain:

```js
window.CAPE_CONFIG = { API_BASE_URL: "" };
```

## 3. Test cross-device login on the same Wi-Fi

On the computer running the server, find its LAN IPv4 address.

Windows:

```bash
ipconfig
```

Example: `192.168.1.25`

On another phone/computer connected to the same network, open:

```text
http://192.168.1.25:4000
```

Create the account on device A. Then sign in on device B using the **same email and password**. Both devices are using the same server-side demo database, so the account is not tied to the first browser.

If the second device cannot connect, allow Node.js through the computer firewall for private networks and confirm both devices are on the same Wi-Fi/LAN.

### If you specifically want VS Code Live Server

Live Server serves the frontend but does not run the API. Start the API with `npm start`, then set `public/config.js` to:

```js
window.CAPE_CONFIG = {
  API_BASE_URL: "http://localhost:4000/api"
};
```

For another device, replace `localhost` with the server computer's LAN address:

```js
window.CAPE_CONFIG = {
  API_BASE_URL: "http://192.168.1.25:4000/api"
};
```

For the cleanest test, use the included Node server at `http://localhost:4000` because frontend and API are then same-origin.

## 4. Web deployment

For an internet-accessible test environment, deploy the Node application to a Node-capable host such as Render, Railway, Fly.io, or your own VPS. Use HTTPS and set `JWT_SECRET` as a server environment variable.

If the frontend is hosted separately, set:

```js
window.CAPE_CONFIG = {
  API_BASE_URL: "https://your-api.example.com/api"
};
```

If the frontend is on another origin, set the API's `FRONTEND_ORIGIN` environment variable to the frontend origin.

## API map

- `GET /api/health` — server health
- `POST /api/auth/register` — create account
- `POST /api/auth/login` — sign in and receive access token
- `GET /api/auth/me` — validate current session
- `POST /api/auth/logout` — client-side session completion endpoint
- `POST /api/auth/change-password` — authenticated password change
- `POST /api/auth/request-reset` — password-reset request (development returns a test token)
- `PUT /api/profile` — authenticated profile update
- `GET /api/account/summary` — authenticated demo balance and transactions
- `GET /api/notifications` — authenticated notifications
- `GET /api/bills` — authenticated demo bills
- `POST /api/transfers` — authenticated demo transfer endpoint; deliberately returns `CB-DEMO-403` and never moves money

## Password Show/Hide fix

The login and signup fields use dedicated `type="button"` controls and `togglePassword()`. Clicking **Show** changes the input to text; clicking **Hide** changes it back to password. It no longer submits the form or gets swallowed by the form handler.

## What is synchronized across devices

The account identity, password authentication, profile information, and demo account data live on the API server. Each device receives its own login token, so users can independently sign in on a phone and computer.

## Important prototype boundary

This is a fictional banking application for interface and authentication testing. The balance and transactions are demonstration data, and transfer execution is deliberately blocked. The JSON persistence is suitable for local/demo testing only.

For a production financial application, replace JSON persistence with a managed database such as PostgreSQL and add HTTPS everywhere, MFA, secure session/device management, authorization, CSRF protections where applicable, audit logs, secret management, stronger rate limiting, fraud controls, encryption, backups, monitoring, penetration testing and applicable financial/privacy compliance.


## GitHub Pages fix

This version intentionally keeps the frontend files at the repository root: `index.html`, `styles.css`, `app.js`, `config.js`, `manifest.json`, and `sw.js`. GitHub Pages publishes the root folder when the Pages source is set to `main` + `/ (root)`. Do not flatten a `public/` folder into the root while leaving the old `css/` and `js/` paths in `index.html`.

GitHub Pages can host the frontend, but it cannot run the Node/Express API. For cross-device signup/login, deploy the `api/` Node server (or the whole repository) to a Node-capable host and then change `config.js` to the public API URL ending in `/api`.

### GitHub Pages
1. Upload the contents of this folder to the repository root.
2. GitHub → Settings → Pages → Deploy from a branch → `main` → `/ (root)` → Save.
3. Wait for the Pages deployment, then open the published URL.

### Cross-device API
Deploy this same repository as a Node Web Service. Build command: `npm install`. Start command: `npm start`. Set `JWT_SECRET` to a long random value and, if the frontend is on GitHub Pages, set `FRONTEND_ORIGIN` to the exact GitHub Pages URL.
4. Copy the API URL into `config.js`, for example `https://your-cape-bank-api.onrender.com/api`.
5. Commit/push `config.js` to GitHub.

For local testing, `npm install` then `npm start` serves both the frontend and API at `http://localhost:4000`.
