# Deploy Checklist

## Environment

Set these variables in Vercel Project Settings > Environment Variables for Production, Preview, and Development as needed:

- `MONGODB_URI`
- `MONGODB_DB`
- `MONGODB_COLLECTION`

Keep `.env.local` only on local machines. It is ignored by git, and env values should be configured directly in the deployment provider.

## MongoDB Atlas User

Use a dedicated database user for this app. Do not deploy with an Atlas admin user.

Recommended permission:

- Built-in role: `readWrite`
- Scope: only the app database named by `MONGODB_DB`

If you use a custom role, allow only the collections the app needs, currently the collection named by `MONGODB_COLLECTION`.

## Player CSP

The iframe hosts allowed by the app are controlled in two places and must stay in sync:

- Runtime URL sanitizer: `lib/playerSecurity.js`
- Browser CSP `frame-src`: `next.config.mjs`

When adding a new player host, add it to both places and run:

```bash
npm run build
npx eslint app components lib
npm audit --omit=dev
```

## Pre-Deploy Commands

Run these before production deploy:

```bash
npm run build
npx eslint app components lib
npm audit --omit=dev
```
