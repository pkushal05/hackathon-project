# FleetPulse DRT

**Predictive Transit Fleet Maintenance & Parts Forecasting Platform**

A production-ready MERN stack web application for public transit maintenance departments. Monitor fleet condition, detect overdue preventative maintenance, forecast upcoming work, and optimize parts ordering.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Vite, TailwindCSS, React Query, React Leaflet, Recharts |
| Backend | Node.js, Express, Mongoose |
| Database | MongoDB Atlas |
| DevOps | Docker, Nginx |

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas cluster
- npm

### 1. Clone & Setup

```bash
git clone <repository-url>
cd hackathon-project
```

### 2. Backend Setup

```bash
cd server
cp .env.example .env
# Edit .env with your MongoDB Atlas URI
npm install
npm run dev
```

### 3. Frontend Setup

```bash
cd client
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

### 4. Docker (Production)

```bash
# From project root
docker-compose up --build
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB Atlas connection string | — |
| `PORT` | Server port | `5000` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `GTFS_FEED_URL` | GTFS-Realtime vehicle positions feed | — |
| `PLANNED_MONTHLY_DISTANCE` | Average monthly distance per bus (km) | `5000` |

## Features

- **Dashboard** — Fleet health metrics, forecast charts, service distribution
- **Fleet Map** — Live GTFS-RT bus tracking with urgency-colored markers
- **Buses Management** — Full CRUD for fleet inventory
- **Maintenance Records** — Track PM data with urgency scoring
- **Parts Catalog** — Manage maintenance parts
- **Service Types** — Define service levels (A/B/C/D hierarchy)
- **Forecast Dashboard** — Predictive maintenance & parts demand (7/14/30-day windows)
- **Settings** — Configure GTFS feed, forecast parameters

## Project Structure

```
├── client/                # React frontend
│   ├── src/
│   │   ├── api/           # Axios API client
│   │   ├── components/    # Layout, Modal
│   │   └── pages/         # 8 page components
│   └── vite.config.js
├── server/                # Express backend
│   ├── config/            # Database connection
│   ├── controllers/       # Route handlers
│   ├── middleware/         # Error handler, validation
│   ├── models/            # 7 Mongoose models
│   ├── routes/            # API routes
│   └── services/          # Business logic
├── docker/                # Docker configs
├── docs/                  # API documentation
└── docker-compose.yml
```

## API Documentation

See [docs/API.md](docs/API.md) for complete endpoint documentation.

## Urgency Scoring

The system calculates urgency scores (0–100) based on:
- Overdue kilometers (`unitsLateKm > 0` → +70)
- Overdue distance (`min(unitsLateKm / 100, 20)`)
- Days late (`min(daysLate * 1.2, 10)`)
- Risk ratio (`unitsToGoKm / frequencyKm`)
- Service severity weight

## License

MIT