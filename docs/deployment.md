# Deployment guide

The frontend and Express API should be deployed as separate services.

## Frontend on Vercel

1. Push the repository to a Git provider.
2. Import the repository into Vercel.
3. Use the default Vite build settings:

   | Setting | Value |
   | --- | --- |
   | Build command | `npm run build` |
   | Output directory | `dist` |
   | Install command | `npm install` |

4. Deploy.

For React Router deep links such as `/admin`, configure a rewrite to `index.html` if your hosting provider does not supply SPA fallback automatically.

## API on Render

1. Create a new Web Service from the repository.
2. Select Node as the runtime.
3. Use these commands:

   | Setting | Value |
   | --- | --- |
   | Build command | `npm install` |
   | Start command | `npm run server` |

4. Add all SMTP environment variables from `.env` in Render's environment settings.
5. Deploy and confirm `GET /health` returns `{ "status": "ok" }`.

## Before production

- Replace development SMTP credentials with real provider credentials.
- Restrict server CORS to the deployed frontend domain.
- Set up an uptime monitor for the API health endpoint.
- Add database and authentication infrastructure before treating the admin panel as a multi-device CMS.
- Ensure client requests use the deployed API URL rather than a local address.

## Post-deployment smoke test

1. Visit every public route.
2. Open `/admin` and test responsive navigation.
3. Add, edit, and delete a content item; refresh to verify browser persistence.
4. Submit the contact form and confirm receipt in `EMAIL_TO`.
5. Request `/health` from the deployed API.
