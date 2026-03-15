# FleetPulse DRT API Documentation

## Base URL

`http://localhost:5000/api`

## Authentication

Most endpoints require JWT auth.

- Header: `Authorization: Bearer <token>`
- Public endpoints: `GET /health`, `POST /auth/register`, `POST /auth/login`

## Standard Response Shape

Success:

```json
{
  "success": true,
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "error": "Error message"
}
```

Validation error:

```json
{
  "success": false,
  "errors": ["field is required"]
}
```

## Health

### GET /health

Health check endpoint.

## Auth

### POST /auth/register

Register user.

Request body:

```json
{
  "name": "Transit Admin",
  "email": "admin@example.com",
  "password": "strong-password"
}
```

### POST /auth/login

Login user.

Request body:

```json
{
  "email": "admin@example.com",
  "password": "strong-password"
}
```

### GET /auth/me

Return current authenticated user.

### GET /auth/pending-users

Admin only.

### GET /auth/users

Admin only.

### PATCH /auth/approve/:id

Admin only.

### PATCH /auth/deny/:id

Admin only.

### PATCH /auth/make-admin/:id

Admin only.

## Buses

### GET /buses

List all buses.

### GET /buses/:id

Get bus by id.

### POST /buses

Create bus.

```json
{
  "busNumber": "1001",
  "alias": "BUS-1001",
  "manufacturer": "Nova Bus",
  "year": 2020,
  "garage": "Central",
  "status": "Operating"
}
```

### PUT /buses/:id

Update bus.

### DELETE /buses/:id

Delete bus.

## Maintenance Records

### GET /maintenance

List maintenance records with urgency scoring.

### GET /maintenance/health

Fleet health summary.

### GET /maintenance/:id

Get maintenance record by id.

### POST /maintenance

Create maintenance record.

```json
{
  "busAlias": "BUS-1001",
  "pmNumber": "PM-001",
  "pmDescription": "Oil Change",
  "lastOdometerReading": 125000,
  "nextTriggerKm": 130000,
  "unitsToGoKm": 5000,
  "unitsLateKm": 0,
  "dayslate": 0,
  "frequencyKm": 10000,
  "toleranceKm": 500,
  "reportDate": "2026-03-15",
  "serviceType": "A",
  "pmStatus": "Active",
  "assetStatus": "Operating"
}
```

### PUT /maintenance/:id

Update maintenance record.

### DELETE /maintenance/:id

Delete maintenance record.

## Service Types

### GET /services

List service types.

### GET /services/:id

Get service type by id.

### POST /services

Create service type.

```json
{
  "name": "D",
  "description": "Major overhaul",
  "severityWeight": 4,
  "includes": ["A", "B", "C"]
}
```

### PUT /services/:id

Update service type.

### DELETE /services/:id

Delete service type.

## Parts

### GET /parts

List parts.

### GET /parts/:id

Get part by id.

### POST /parts

Create part.

```json
{
  "partNumber": "OIL-FILTER-01",
  "name": "Oil Filter",
  "category": "Filters",
  "manufacturer": "Fleetguard",
  "unit": "each"
}
```

### PUT /parts/:id

Update part.

### DELETE /parts/:id

Delete part.

## Service Parts

### GET /service-parts

List service-part mappings.

Query params:

- `serviceType` (optional)
- `busModel` (optional)

### GET /service-parts/:id

Get service-part mapping by id.

### POST /service-parts

Create service-part mapping.

```json
{
  "serviceType": "A",
  "busModel": "Nova Bus",
  "partNumber": "OIL-FILTER-01",
  "quantity": 2
}
```

### PUT /service-parts/:id

Update service-part mapping.

### DELETE /service-parts/:id

Delete service-part mapping.

## Forecast: Maintenance

### GET /forecast/maintenance

List maintenance forecasts.

Query params:

- `window` (optional): `7`, `14`, `30`

### POST /forecast/maintenance/generate

Generate maintenance forecasts.

### DELETE /forecast/maintenance/:id

Delete maintenance forecast.

## Forecast: Parts

### GET /forecast/parts

List parts forecasts.

Query params:

- `window` (optional): `7`, `14`, `30`

### POST /forecast/parts/generate

Generate parts forecasts.

### DELETE /forecast/parts/:id

Delete parts forecast.

## Dashboard and GTFS

### GET /vehicles

Get GTFS-Realtime vehicle positions enriched with urgency and bus metadata.

### GET /dashboard

Get dashboard aggregate stats and chart datasets.

### POST /dashboard/generate

Run full forecast pipeline (maintenance + parts).

Response example:

```json
{
  "success": true,
  "data": {
    "maintenanceCount": 42,
    "partsCount": 27
  }
}
```

## Chat

### POST /chat

Answer operational questions via AI (if configured) with deterministic fallback.

Request body:

```json
{
  "message": "How many buses are overdue?"
}
```

Response example:

```json
{
  "reply": "There are 5 overdue buses out of 34 total buses.",
  "source": "fallback"
}
```
