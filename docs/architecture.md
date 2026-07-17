# Architecture and code map

## Overview

The repository is a single Vite project containing both the React frontend and a small Express API. The frontend and API run as separate processes during development and can be deployed independently.

```text
Browser
  ├─ React / Vite portfolio
  │   ├─ Public portfolio routes
  │   └─ /admin content workspace
  └─ Express API
      └─ POST /api/contact → SMTP provider → inbox
```

## Directory structure

```text
.
├── public/                 Static assets served unchanged
├── src/
│   ├── assets/             Portfolio images and SVG assets
│   ├── components/         Shared visual components
│   ├── layouts/            Public-site layout and navigation
│   ├── pages/              Route-level React pages
│   │   └── Admin.jsx       Admin dashboard, content editor, and inbox
│   ├── styles/             Global and admin styles
│   ├── App.jsx             Route definitions and lazy loading
│   └── main.jsx            React application bootstrap
├── server/
│   ├── routes/contact.js   Contact form email route
│   └── index.js            Express app bootstrap
├── .env                    Local server environment variables
├── package.json            Scripts and dependencies
└── vite.config.js          Vite configuration
```

## Frontend routing

`src/App.jsx` lazy-loads route pages. Public routes are wrapped by `src/layouts/Layout.jsx`; `/admin` is rendered separately so the public navigation and footer do not appear inside the dashboard.

## Styling

The portfolio primarily uses Tailwind utility classes with base styles in `src/styles/index.css`. The admin workspace uses scoped selectors in `src/styles/admin.css`, beginning with `.admin-shell`. This keeps the dark dashboard styling from changing the light public portfolio.

## Admin state and persistence

`src/pages/Admin.jsx` contains the dashboard and management interfaces. The `useCollection` hook uses a dedicated `localStorage` key for each editable area:

| Area | Storage key |
| --- | --- |
| Home | `portfolio-admin-home` |
| About | `portfolio-admin-about` |
| Services | `portfolio-admin-services` |
| Skills | `portfolio-admin-skills` |
| Projects | `portfolio-admin-projects` |

This is suitable for a UI prototype and a single browser. It is not a replacement for database persistence or authorization.

## Backend request lifecycle

1. The user submits the contact form on the public site.
2. The form sends a request to `POST /api/contact`.
3. `server/routes/contact.js` validates that `name`, `email`, and `message` are present.
4. Nodemailer creates an SMTP transport from environment variables.
5. The API sends an email to `EMAIL_TO` and responds with success or an error.

## Recommended production evolution

1. Move content from browser storage into MongoDB collections.
2. Add admin login, password hashing, JWT/cookie sessions, and route protection.
3. Create CRUD endpoints for every content type.
4. Replace the admin `useCollection` storage hook with Axios or TanStack Query API calls.
5. Add Cloudinary upload endpoints for project and profile images.
6. Store contact messages in MongoDB before or alongside email notification.
