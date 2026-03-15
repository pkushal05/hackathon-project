import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Map,
  Bus,
  Wrench,
  Package,
  TrendingUp,
  Info,
  UserCheck,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import logo from "../assets/logo.png";

const baseNavItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/fleet-map", label: "Fleet Map", icon: Map },
  { to: "/buses", label: "Buses", icon: Bus },
  { to: "/maintenance", label: "Maintenance", icon: Wrench },
  { to: "/parts", label: "Parts", icon: Package },
  { to: "/forecast", label: "Forecast", icon: TrendingUp },
  { to: "/about", label: "About", icon: Info },
];

export default function Layout({ children, user, onLogout }) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 980);
  const location = useLocation();
  const navItems =
    user?.role === "admin"
      ? [
          ...baseNavItems,
          { to: "/admin/approvals", label: "Approvals", icon: UserCheck },
        ]
      : baseNavItems;
  const page =
    navItems.find((item) => item.to === location.pathname)?.label ||
    "Dashboard";

  useEffect(() => {
    function onResize() {
      setIsMobile(window.innerWidth <= 980);
    }

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="app-shell">
      {open ? (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(2,6,23,0.56)",
            zIndex: 30,
          }}
        />
      ) : null}

      <motion.aside
        className={`sidebar ${open ? "open" : ""}`}
        initial={false}
        animate={isMobile ? { x: open ? 0 : -260 } : { x: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <div className="sidebar-logo">
          <div className="brand-header">
            <img src={logo} alt="DRT logo" className="brand-logo-image" />
            <div>
              <h2 className="brand-title">FleetPulse DRT</h2>
              <p className="brand-subtitle">Transit Operations Platform</p>
            </div>
          </div>
        </div>

        <nav className="nav-list">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </motion.aside>

      <div className="main-panel">
        <header className="top-nav">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              className="icon-btn menu-toggle"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X size={16} /> : <Menu size={16} />}
            </button>
            <img src={logo} alt="DRT logo" className="top-nav-logo" />
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{page}</div>
              <div className="top-nav-meta">Agency Operations Dashboard</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className="top-nav-meta">
              {user?.name
                ? `Signed in as ${user.name}`
                : "System Status: Online"}
            </div>
            <button className="btn btn-secondary" onClick={onLogout}>
              <span
                style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
              >
                <LogOut size={16} />
                Logout
              </span>
            </button>
          </div>
        </header>

        <main className="main-scroll">
          <div className="main-content-container">{children}</div>
        </main>
      </div>
    </div>
  );
}
