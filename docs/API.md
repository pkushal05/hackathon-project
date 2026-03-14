# FleetPulse DRT API Documentation

## Base URL
```
http://localhost:5000/api
```

---

## Buses

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/buses` | List all buses |
| GET | `/buses/:id` | Get bus by ID |
| POST | `/buses` | Create a bus |
| PUT | `/buses/:id` | Update a bus |
| DELETE | `/buses/:id` | Delete a bus |

### Bus Object
```json
{
  "busNumber": "1001",
  "alias": "BUS-1001",
  "manufacturer": "Nova Bus",
  "model": "LFS",
  "year": 2020,
  "garage": "Central",
  "status": "Active"
}
```

---

## Maintenance Records

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/maintenance` | List all records (with urgency scores) |
| GET | `/maintenance/health` | Fleet health summary |
| GET | `/maintenance/:id` | Get record by ID |
| POST | `/maintenance` | Create a record |
| PUT | `/maintenance/:id` | Update a record |
| DELETE | `/maintenance/:id` | Delete a record |

### Maintenance Record Object
```json
{
  "busAlias": "BUS-1001",
  "pmNumber": "PM-001",
  "pmDescription": "Oil Change",
  "serviceType": "A",
  "lastOdometerReading": 125000,
  "nextTriggerKm": 130000,
  "unitsToGoKm": 5000,
  "unitsLateKm": 0,
  "daysLate": 0,
  "frequencyKm": 10000,
  "toleranceKm": 500,
  "reportDate": "2025-01-15",
  "pmStatus": "Active",
  "assetStatus": "Operating"
}
```

---

## Service Types

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/services` | List all service types |
| GET | `/services/:id` | Get service type by ID |
| POST | `/services` | Create a service type |
| PUT | `/services/:id` | Update a service type |
| DELETE | `/services/:id` | Delete a service type |

### Service Type Object
```json
{
  "name": "D",
  "description": "Major overhaul",
  "severityWeight": 4,
  "includes": ["A", "B", "C"]
}
```

---

## Parts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/parts` | List all parts |
| GET | `/parts/:id` | Get part by ID |
| POST | `/parts` | Create a part |
| PUT | `/parts/:id` | Update a part |
| DELETE | `/parts/:id` | Delete a part |

### Part Object
```json
{
  "partNumber": "OIL-FILTER-01",
  "name": "Oil Filter",
  "category": "Filters",
  "manufacturer": "Fleetguard",
  "unit": "each"
}
```

---

## Service Parts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/service-parts` | List service parts (filter: `?serviceType=A&busModel=LFS`) |
| GET | `/service-parts/:id` | Get by ID |
| POST | `/service-parts` | Create |
| PUT | `/service-parts/:id` | Update |
| DELETE | `/service-parts/:id` | Delete |

### Service Part Object
```json
{
  "serviceType": "A",
  "busModel": "LFS",
  "partNumber": "OIL-FILTER-01",
  "quantity": 2
}
```

---

## Maintenance Forecast

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/forecast/maintenance` | List forecasts (filter: `?window=7`) |
| POST | `/forecast/maintenance/generate` | Generate forecasts |
| DELETE | `/forecast/maintenance/:id` | Delete a forecast |

---

## Parts Forecast

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/forecast/parts` | List forecasts (filter: `?window=30`) |
| POST | `/forecast/parts/generate` | Generate forecasts |
| DELETE | `/forecast/parts/:id` | Delete a forecast |

---

## GTFS & Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/vehicles` | GTFS-RT vehicle positions (enriched) |
| GET | `/dashboard` | Dashboard statistics |
| POST | `/dashboard/generate` | Run full forecast pipeline |
| GET | `/health` | API health check |

---

## Response Format

All responses follow:
```json
{
  "success": true,
  "data": { ... }
}
```

Errors:
```json
{
  "success": false,
  "error": "Error message"
}
```
