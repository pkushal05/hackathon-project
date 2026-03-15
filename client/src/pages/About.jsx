import PageContainer from "../components/ui/PageContainer";
import DashboardCard from "../components/ui/DashboardCard";
import SectionHeader from "../components/ui/SectionHeader";

const quickStartSteps = [
  "Open Dashboard to view fleet health, overdue counts, and forecast totals.",
  "Visit Maintenance to review records and verify service types.",
  "Go to Forecast and click Generate to refresh maintenance and parts forecasts.",
  "Use Fleet Map to monitor live vehicle positions and top maintenance alerts.",
  "Use Parts and Service Parts to keep inventory mappings up to date.",
];

const features = [
  {
    title: "Dashboard",
    detail:
      "System overview with fleet health summary, service distribution, and demand snapshots.",
  },
  {
    title: "Fleet Map",
    detail:
      "Live map with urgency-colored vehicles, popup diagnostics, and maintenance context.",
  },
  {
    title: "Buses",
    detail:
      "Fleet registry for unit details such as alias, manufacturer, status, and garage.",
  },
  {
    title: "Maintenance",
    detail:
      "Preventive maintenance records with urgency score drivers and due calculations.",
  },
  {
    title: "Parts",
    detail:
      "Parts catalog for procurement planning and forecast quantity interpretation.",
  },
  {
    title: "Forecast",
    detail:
      "7/14/30-day maintenance and parts demand projections generated from live records.",
  },
];

const troubleshooting = [
  {
    issue: "Parts forecast is empty",
    action:
      "Run Generate in Forecast and confirm service-part mappings exist for serviceType + bus model combinations.",
  },
  {
    issue: "Map has no vehicles",
    action:
      "Check GTFS feed availability and verify backend API health endpoint returns success.",
  },
  {
    issue: "Unexpected urgency values",
    action:
      "Review unitsLateKm, daysLate, and frequencyKm in Maintenance records for outliers.",
  },
];

const apiGroups = [
  {
    name: "Fleet",
    endpoints: "GET/POST/PUT/DELETE /api/buses",
  },
  {
    name: "Maintenance",
    endpoints: "GET/POST/PUT/DELETE /api/maintenance",
  },
  {
    name: "Service Parts",
    endpoints: "GET /api/service-parts?serviceType=&busModel=",
  },
  {
    name: "Forecast",
    endpoints:
      "POST /api/dashboard/generate, GET /api/forecast/maintenance, GET /api/forecast/parts",
  },
];

export default function AboutPage() {
  return (
    <PageContainer
      title="About"
      subtitle="FleetPulse DRT platform guide, architecture summary, and operational playbook"
    >
      <DashboardCard>
        <SectionHeader title="What This Platform Does" />
        <p>
          FleetPulse DRT is a transit operations platform that combines fleet
          health monitoring, preventive maintenance forecasting, and parts
          demand planning. It helps operations teams prioritize risk, reduce
          service delays, and plan inventory from real maintenance signals.
        </p>
      </DashboardCard>

      <DashboardCard>
        <SectionHeader title="Quick User Guide" />
        <ol style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 8 }}>
          {quickStartSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </DashboardCard>

      <DashboardCard>
        <SectionHeader title="Feature Reference" />
        <div className="dashboard-grid-2">
          {features.map((feature) => (
            <div key={feature.title}>
              <p className="card-muted" style={{ marginBottom: 6 }}>
                {feature.title}
              </p>
              <p style={{ margin: 0 }}>{feature.detail}</p>
            </div>
          ))}
        </div>
      </DashboardCard>

      <DashboardCard>
        <SectionHeader title="Forecast Workflow" />
        <p style={{ marginTop: 0 }}>
          The forecast engine computes upcoming maintenance windows (7, 14, and
          30 days), then aggregates required parts from service-part mappings.
          If parts forecasts appear empty, validate serviceType and bus model
          mappings before regenerating.
        </p>
      </DashboardCard>

      <DashboardCard>
        <SectionHeader title="API Surface" />
        <div className="dashboard-grid-2">
          {apiGroups.map((group) => (
            <div key={group.name}>
              <p className="card-muted" style={{ marginBottom: 6 }}>
                {group.name}
              </p>
              <p style={{ margin: 0 }}>{group.endpoints}</p>
            </div>
          ))}
        </div>
      </DashboardCard>

      <DashboardCard>
        <SectionHeader title="Troubleshooting" />
        <div style={{ display: "grid", gap: 10 }}>
          {troubleshooting.map((item) => (
            <div key={item.issue}>
              <p className="card-muted" style={{ marginBottom: 4 }}>
                {item.issue}
              </p>
              <p style={{ margin: 0 }}>{item.action}</p>
            </div>
          ))}
        </div>
      </DashboardCard>

      <DashboardCard>
        <SectionHeader title="Tech Stack" />
        <div className="dashboard-grid-2">
          <div>
            <p className="card-muted">Frontend</p>
            <p>React + Vite + React Query + Leaflet</p>
          </div>
          <div>
            <p className="card-muted">Backend</p>
            <p>Node.js + Express + Mongoose</p>
          </div>
          <div>
            <p className="card-muted">Database</p>
            <p>MongoDB Atlas</p>
          </div>
          <div>
            <p className="card-muted">Deployment</p>
            <p>Docker + Nginx</p>
          </div>
        </div>
      </DashboardCard>
    </PageContainer>
  );
}
