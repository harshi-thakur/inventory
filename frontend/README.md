# Frontend

React + Vite frontend for the inventory order management app.

## Requirements

- Node.js 18+ recommended
- `pnpm`

## Install

From the `frontend` folder:

```bash
pnpm install
```

## Development

Start the Vite dev server:

```bash
pnpm dev
```

The app runs on `http://localhost:5173` by default.

## Build

Create a production build:

```bash
pnpm build
```

## Preview production build

Preview the built app locally:

```bash
pnpm preview
```

## Production server

The `server.js` file serves the built `dist/` folder with Express.

Run it after building:

```bash
node server.js
```

It listens on `http://localhost:3000`.

## Docker

There are two Dockerfiles in this folder:

- `Dockerfile.dev` for local development with hot reload
- `Dockerfile` for the production build and server

## Project structure

- `src/main.jsx` - application entry point
- `src/App.jsx` - top-level app component
- `src/components/` - reusable UI components
- `src/pages/` - page-level views
- `src/services/` - API and service helpers
- `src/store/` - Zustand state management
- `src/utils/` - shared utility helpers

## Notes

- The frontend uses Vite, React, Tailwind CSS, Zustand, Axios, React Router, and Sonner.
- Set `VITE_API_URL` in Vercel to point to your deployed backend, for example `https://your-backend.onrender.com`.