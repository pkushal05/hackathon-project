import { useState } from "react";
import { CheckCircle, Save } from "lucide-react";
import PageContainer from "../components/ui/PageContainer";
import DashboardCard from "../components/ui/DashboardCard";
import SectionHeader from "../components/ui/SectionHeader";
import FormField from "../components/ui/FormField";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    plannedMonthlyDistance: 5000,
    refreshInterval: 30,
  });

  function handleSave() {
    localStorage.setItem("fleetpulse_settings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <PageContainer
      title="Settings"
      subtitle="Environment configuration and operating preferences"
      actions={
        <button className="btn btn-primary" onClick={handleSave}>
          <span
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            {saved ? <CheckCircle size={14} /> : <Save size={14} />}
            {saved ? "Saved" : "Save Settings"}
          </span>
        </button>
      }
    >
      <DashboardCard>
        <SectionHeader title="GTFS Feed" />
        <div className="form-stack">
          <FormField
            label="Auto-refresh Interval (seconds)"
            type="number"
            min={5}
            max={120}
            value={settings.refreshInterval}
            onChange={(value) =>
              setSettings({ ...settings, refreshInterval: Number(value) })
            }
          />
        </div>
      </DashboardCard>

      <DashboardCard>
        <SectionHeader title="Forecast Parameters" />
        <FormField
          label="Planned Monthly Distance (km)"
          type="number"
          min={100}
          value={settings.plannedMonthlyDistance}
          onChange={(value) =>
            setSettings({ ...settings, plannedMonthlyDistance: Number(value) })
          }
        />
      </DashboardCard>

      <DashboardCard>
        <SectionHeader title="Platform Details" />
        <div className="dashboard-grid-2">
          <div>
            <p className="card-muted">Platform</p>
            <p>MERN Stack</p>
          </div>
          <div>
            <p className="card-muted">Frontend</p>
            <p>React + Vite</p>
          </div>
          <div>
            <p className="card-muted">Backend</p>
            <p>Express + Mongoose</p>
          </div>
          <div>
            <p className="card-muted">Database</p>
            <p>MongoDB Atlas</p>
          </div>
        </div>
      </DashboardCard>
    </PageContainer>
  );
}
