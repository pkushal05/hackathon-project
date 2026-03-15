# FleetPulse DRT

Predictive Transit Fleet Maintenance and Parts Forecasting Platform.

FleetPulse DRT helps public transit operations teams monitor fleet health, track maintenance urgency, and forecast future service and parts demand.

## Features

- Fleet health dashboard with overdue, due-soon, and healthy counts
- Maintenance records with urgency scoring
- Forecast generation for maintenance windows (7/14/30 days)
- Parts demand forecast based on service rules
- Live fleet map with GTFS-Realtime integration
- JWT authentication and protected API routes

## Tech Stack

| Layer    | Technologies                                                                  |
| -------- | ----------------------------------------------------------------------------- |
| Frontend | React, Vite, Tailwind CSS, React Query, React Router, Recharts, React Leaflet |
| Backend  | Node.js, Express, Mongoose, Express Validator                                 |
| Security | JWT, bcryptjs, Helmet, CORS, express-rate-limit                               |
| Database | MongoDB Atlas                                                                 |
| DevOps   | Docker, Docker Compose, Nginx                                                 |

## Project Structure

```text
.
├── client/                 # React frontend
├── server/                 # Express backend
├── docs/                   # Technical docs
├── docker/                 # Docker and Nginx configs
├── docker-compose.yml
└── .env.example
```

## Prerequisites

- Node.js 18+
- npm
- MongoDB Atlas connection URI

## Environment Variables

Create `.env` at the project root based on `.env.example`.

Required:

- `MONGO_URI`
- `JWT_SECRET`

Common:

- `PORT` (default: `5000`)
- `CLIENT_URL` (default: `http://localhost:5173`)
- `JWT_EXPIRES_IN` (default: `12h`)
- `GTFS_FEED_URL` (optional)
- `PLANNED_MONTHLY_DISTANCE` (default: `5000`)
- `ADMIN_EMAILS` (optional)
- `OPENAI_API_KEY` (optional for AI chat)
- `OPENAI_MODEL` (default: `gpt-4o-mini`)
- `OPENAI_BASE_URL` (default: `https://api.openai.com/v1`)

## Local Development

### 1. Install dependencies

```bash
cd server
npm install

cd ../client
npm install
```

### 2. Start backend

```bash
cd server
npm run dev
```

Backend URL: `http://localhost:5000`

### 3. Start frontend

```bash
cd client
npm run dev
```

Frontend URL: `http://localhost:5173`

## Production Build and Run

Build frontend:

```bash
cd client
npm run build
npm run preview
```

Run backend in production mode:

```bash
cd server
npm run start
```

Run full stack with Docker:

```bash
docker-compose up --build
```

## NPM Scripts

Server scripts:

- `npm run dev` - start API with watch mode
- `npm run start` - start API

Client scripts:

- `npm run dev` - start Vite dev server
- `npm run build` - build production bundle
- `npm run preview` - preview production build
- `npm run lint` - run ESLint

## API Reference

See [docs/API.md](docs/API.md) for full endpoint documentation and examples.

## License

MIT
