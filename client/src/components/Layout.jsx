import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Map, Bus, Wrench, Package, Layers, TrendingUp, Settings, Menu, X, Zap, ChevronRight, Activity } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', desc: 'Overview' },
  { to: '/fleet-map', icon: Map, label: 'Fleet Map', desc: 'Live tracking' },
  { to: '/buses', icon: Bus, label: 'Buses', desc: 'Fleet inventory' },
  { to: '/maintenance', icon: Wrench, label: 'Maintenance', desc: 'PM records' },
  { to: '/parts', icon: Package, label: 'Parts', desc: 'Parts catalog' },
  { to: '/services', icon: Layers, label: 'Services', desc: 'Service types' },
  { to: '/forecast', icon: TrendingUp, label: 'Forecast', desc: 'Predictions' },
  { to: '/settings', icon: Settings, label: 'Settings', desc: 'Configuration' },
];

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const currentPage = navItems.find(n => n.to === location.pathname) || navItems[0];

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#05080f' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[260px] flex flex-col transition-transform duration-500 ease-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{
          background: 'linear-gradient(180deg, rgba(13, 19, 33, 0.95) 0%, rgba(5, 8, 15, 0.98) 100%)',
          borderRight: '1px solid rgba(99, 102, 241, 0.06)',
        }}
      >
        {/* Logo */}
        <div className="px-6 py-6" style={{ borderBottom: '1px solid rgba(99, 102, 241, 0.06)' }}>
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center relative shrink-0"
              style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
              <Zap className="w-5 h-5 text-white relative z-10" />
              <div className="absolute inset-0 rounded-2xl" style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', filter: 'blur(12px)', opacity: 0.4 }} />
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight"
                style={{ background: 'linear-gradient(135deg, #e0e7ff, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                FleetPulse
              </h1>
              <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: '#334155' }}>
                DRT Platform
              </p>
            </div>
            <button className="ml-auto lg:hidden p-1.5 rounded-lg hover:bg-white/5" onClick={() => setSidebarOpen(false)}>
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          <p className="px-3 mb-3 text-[9px] font-bold tracking-[0.2em] uppercase" style={{ color: '#1e293b' }}>Navigation</p>
          <div className="space-y-1">
            {navItems.map(({ to, icon: Icon, label, desc }, i) => (
              <NavLink key={to} to={to} end={to === '/'}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-300 ${
                    isActive
                      ? 'text-white font-semibold'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]'
                  }`
                }>
                {({ isActive }) => (
                  <>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 shrink-0 ${
                      isActive
                        ? 'bg-indigo-500/15'
                        : 'bg-transparent'
                    }`}>
                      <Icon className={`w-4 h-4 transition-colors duration-300 ${isActive ? 'text-indigo-400' : 'text-slate-600 group-hover:text-slate-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="block text-[13px] leading-tight">{label}</span>
                      <span className={`block text-[10px] mt-0.5 transition-colors ${isActive ? 'text-indigo-400/50' : 'text-slate-700'}`}>{desc}</span>
                    </div>
                    {isActive && (
                      <div className="w-1 h-6 rounded-full shrink-0" style={{ background: 'linear-gradient(180deg, #6366f1, transparent)' }} />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Bottom */}
        <div className="px-4 py-4" style={{ borderTop: '1px solid rgba(99, 102, 241, 0.04)' }}>
          <div className="rounded-xl p-3.5 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.06), rgba(6, 182, 212, 0.03))' }}>
            <div className="flex items-center gap-2 relative">
              <Activity className="w-3 h-3 text-indigo-500" />
              <span className="text-[10px] font-bold tracking-wider uppercase text-indigo-400/70">Fleet Analytics</span>
            </div>
            <p className="text-[10px] text-slate-700 mt-1 relative">v1.0.0 · Production</p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 flex items-center px-8 gap-4 shrink-0 relative"
          style={{ background: 'rgba(5, 8, 15, 0.6)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(99, 102, 241, 0.04)' }}>
          <button className="lg:hidden p-2 rounded-xl hover:bg-white/5 transition-colors" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-4 h-4 text-slate-500" />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-700 font-medium">FleetPulse</span>
            <ChevronRight className="w-3 h-3 text-slate-800" />
            <span className="text-slate-400 font-semibold">{currentPage.label}</span>
          </div>

          <div className="flex-1" />

          {/* Status pill */}
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full" style={{ background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
            <div className="relative">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping opacity-75" />
            </div>
            <span className="text-[11px] font-semibold text-emerald-400/80">Online</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto relative" style={{ background: '#05080f' }}>
          {/* Background glow orbs */}
          <div className="glow-orb" style={{ width: 500, height: 500, top: -200, right: -200, background: '#6366f1' }} />
          <div className="glow-orb" style={{ width: 350, height: 350, bottom: 50, left: -100, background: '#06b6d4' }} />

          <div className="relative z-10 px-8 py-8 lg:px-10 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
