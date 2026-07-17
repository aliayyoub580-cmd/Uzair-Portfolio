# Uzair Ahmad Portfolio

A responsive personal portfolio built with React and Vite. It includes a premium portfolio experience, a contact-email API, and an admin workspace for managing portfolio content in the browser.

## Features

- Responsive portfolio pages: Home, About, Services, Skills, Projects, and Contact.
- Animated interface built with Tailwind CSS, Framer Motion, GSAP, Lenis, Swiper, and Three.js utilities.
- SEO metadata via React Helmet.
- Express contact endpoint with Nodemailer.
- Premium responsive admin workspace at `/admin`.
- Dashboard analytics-style overview, messages inbox, and content management for Home, About, Services, Skills, and Projects.
- Add, edit, and delete content in the admin workspace. Admin content is stored in the browser with `localStorage`.

## Technology

| Area | Technology |
| --- | --- |
| Frontend | React 18, Vite, React Router |
| Styling | Tailwind CSS, custom CSS |
| Motion | Framer Motion, GSAP, Lenis |
| 3D / UI | React Three Fiber, Drei, Lucide React, Swiper |
| Backend | Node.js, Express |
| Email | Nodemailer |

## Quick start

### Requirements

- Node.js 18 or newer
- npm 9 or newer

### Install dependencies

```bash
npm install
```

### Configure the server

Create a `.env` file in the project root. See [docs/api-and-environment.md](docs/api-and-environment.md) for every variable.

### Run the frontend

```bash
npm run dev
```

Vite will print the local URL, normally `http://localhost:5173`.

### Run the contact API

In a second terminal:

```bash
npm run server
```

The API runs on `http://localhost:5000` unless `PORT` is changed.

### Production build

```bash
npm run build
npm run preview
```

## Routes

| Route | Description |
| --- | --- |
| `/` | Portfolio home page |
| `/about` | About page |
| `/services` | Services page |
| `/skills` | Skills page |
| `/projects` | Projects page |
| `/contact` | Contact page |
| `/admin` | Admin dashboard and content manager |

## Documentation

- [Architecture and code map](docs/architecture.md)
- [Admin workspace guide](docs/admin-guide.md)
- [API and environment setup](docs/api-and-environment.md)
- [Deployment guide](docs/deployment.md)

## Important note about the admin workspace

The current admin interface is a client-side management layer. Its content changes are saved to the browser's `localStorage`, so they remain after a refresh in the same browser. They are not yet persisted in MongoDB or shared between devices. The current contact API sends messages by email; it does not yet store them in a database.

For a production multi-user admin system, add server-side authentication, MongoDB models, protected CRUD API routes, Cloudinary uploads, and connect the admin collection hooks to those routes.

## Project scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create a production frontend build in `dist/` |
| `npm run preview` | Preview the production frontend build |
| `npm run server` | Start the Express contact API |

## License

This project is private and intended for the portfolio owner.
