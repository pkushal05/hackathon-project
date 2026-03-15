import PageContainer from "../components/ui/PageContainer";
import DashboardCard from "../components/ui/DashboardCard";
import SectionHeader from "../components/ui/SectionHeader";
import { useQuery } from "@tanstack/react-query";

const githubIds = ["devpatel47", "milanpatel9999", "pkushal05", "si6104"];

async function fetchDevelopers() {
  const responses = await Promise.all(
    githubIds.map(async (username) => {
      const response = await fetch(`https://api.github.com/users/${username}`);
      if (!response.ok) {
        throw new Error("Unable to load developer profiles from GitHub");
      }
      const data = await response.json();
      return {
        login: data.login,
        name: data.name || data.login,
        avatarUrl: data.avatar_url,
        profileUrl: data.html_url,
        bio: data.bio || "No bio available",
      };
    }),
  );

  return responses;
}

const userGuide = [
  "Login with your approved account to access the operations workspace.",
  "Start on Dashboard to review total buses, overdue trends, and due-soon buses.",
  "Open Fleet Map to inspect live bus positions and maintenance urgency context.",
  "Manage fleet records in Buses and keep maintenance data updated in Maintenance.",
  "Maintain part definitions in Parts and service-to-part links in Service Parts.",
  "Go to Forecast and click Regenerate Forecasts to refresh 7/14/30-day projections.",
  "Use Admin Approvals (admins only) to approve, deny, or promote users when required.",
];

const features = [
  {
    title: "Live Operations Dashboard",
    detail:
      "Centralized visibility of fleet health, due-soon buses, forecast trends, and parts demand.",
  },
  {
    title: "Maintenance + Forecast Engine",
    detail:
      "Generates maintenance and parts forecast windows from current records and mapping rules.",
  },
  {
    title: "Admin Access Control",
    detail:
      "JWT-protected APIs with account approval, denial, and admin role management.",
  },
  {
    title: "Fleet Map Intelligence",
    detail:
      "Color-coded map markers and contextual details for active transit vehicles.",
  },
];

const techStack = [
  {
    name: "Frontend",
    value: "React, Vite, React Query, Leaflet, Recharts",
  },
  {
    name: "Backend",
    value: "Node.js, Express, Mongoose",
  },
  {
    name: "Database",
    value: "MongoDB Atlas",
  },
  {
    name: "Security",
    value: "JWT Authentication, Role-based access control",
  },
  {
    name: "Deployment",
    value: "Docker, Nginx",
  },
];

export default function AboutPage() {
  const developersQuery = useQuery({
    queryKey: ["github-developers"],
    queryFn: fetchDevelopers,
    staleTime: 1000 * 60 * 60,
  });

  const developers = developersQuery.data || [];

  return (
    <PageContainer
      title="About"
      subtitle="Platform summary, usage guide, and developer information"
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
        <SectionHeader title="Detailed Quick User Guide" />
        <ul
          style={{
            margin: 0,
            paddingLeft: 24,
            display: "grid",
            gap: 8,
            listStyleType: "disc",
            listStylePosition: "outside",
          }}
        >
          {userGuide.map((step) => (
            <li key={step} style={{ display: "list-item" }}>
              {step}
            </li>
          ))}
        </ul>
      </DashboardCard>

      <DashboardCard>
        <SectionHeader title="Features" />
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
        <SectionHeader title="Tech Stack" />
        <div className="dashboard-grid-2">
          {techStack.map((item) => (
            <div key={item.name}>
              <p className="card-muted" style={{ marginBottom: 6 }}>
                {item.name}
              </p>
              <p style={{ margin: 0 }}>{item.value}</p>
            </div>
          ))}
        </div>
      </DashboardCard>

      <DashboardCard>
        <SectionHeader title="Developer" />
        {developersQuery.isLoading ? (
          <p className="card-muted">
            Loading developer profiles from GitHub...
          </p>
        ) : developersQuery.error ? (
          <p className="auth-error" style={{ margin: 0 }}>
            {developersQuery.error.message}
          </p>
        ) : (
          <div className="dashboard-grid-2">
            {developers.map((developer) => (
              <div
                key={developer.login}
                style={{
                  border: "1px solid rgba(148,163,184,0.2)",
                  borderRadius: 14,
                  padding: 14,
                  display: "grid",
                  gridTemplateColumns: "72px 1fr",
                  gap: 12,
                }}
              >
                <img
                  src={developer.avatarUrl}
                  alt={`${developer.name} avatar`}
                  width={72}
                  height={72}
                  style={{ borderRadius: "999px", objectFit: "cover" }}
                />
                <div>
                  <a
                    href={developer.profileUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontWeight: 700 }}
                  >
                    {developer.name}
                  </a>
                  <p className="card-muted" style={{ margin: "4px 0 8px" }}>
                    @{developer.login}
                  </p>
                  <p style={{ margin: 0 }}>{developer.bio}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardCard>
    </PageContainer>
  );
}
