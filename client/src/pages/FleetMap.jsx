import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { gtfsApi } from '../api/client';
import { AlertTriangle, Gauge, Calendar, Wrench, MapPin, RefreshCw } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

export default function FleetMap() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['gtfs-vehicles'],
    queryFn: gtfsApi.getVehicles,
    refetchInterval: 30000,
  });

  const vehicles = data?.data || [];
  const center = vehicles.length > 0
    ? [vehicles[0].latitude, vehicles[0].longitude]
    : [42.3601, -71.0589]; // Default: Boston (MBTA)

  return (
    <div className="space-y-6">
      <div className="page-header flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="page-title">Fleet Map</h1>
          <p className="page-subtitle">Live GTFS-Realtime vehicle tracking</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-5 text-[11px] font-semibold">
            {[
              { color: '#10b981', label: 'Healthy' },
              { color: '#fbbf24', label: 'Due Soon' },
              { color: '#f97316', label: 'High' },
              { color: '#f43f5e', label: 'Critical' },
            ].map(({ color, label }) => (
              <span key={label} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}40` }} />
                <span className="text-slate-500">{label}</span>
              </span>
            ))}
          </div>
          <button onClick={() => refetch()} className="btn-glow flex items-center gap-2 text-sm">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      <div className="glass-card overflow-hidden relative" style={{ height: 'calc(100vh - 200px)' }}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-12 h-12 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
          </div>
        ) : (
          <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%', borderRadius: '20px' }}>
            <TileLayer
              attribution='&copy; <a href="https://carto.com">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            {vehicles.map((v, i) => (
              <CircleMarker key={i} center={[v.latitude, v.longitude]} radius={7}
                pathOptions={{
                  color: v.urgencyColor || '#10b981',
                  fillColor: v.urgencyColor || '#10b981',
                  fillOpacity: 0.85,
                  weight: 2,
                  opacity: 0.6,
                }}>
                <Popup>
                  <div className="space-y-3 min-w-[220px] py-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${v.urgencyColor || '#10b981'}15` }}>
                        <MapPin className="w-4 h-4" style={{ color: v.urgencyColor || '#10b981' }} />
                      </div>
                      <div>
                        <div className="font-bold text-sm">{v.bus?.busNumber || v.label}</div>
                        <div className="text-[10px]" style={{ color: '#64748b' }}>{v.bus?.alias || 'Unknown'}</div>
                      </div>
                    </div>
                    <div className="space-y-1.5 text-xs" style={{ color: '#94a3b8' }}>
                      <div className="flex items-center gap-2"><Gauge className="w-3 h-3" /> Urgency: <strong style={{ color: v.urgencyColor || '#10b981' }}>{v.urgencyScore || 0}</strong></div>
                      {v.topMaintenanceRecord && (
                        <>
                          <div className="flex items-center gap-2"><Wrench className="w-3 h-3" /> {v.topMaintenanceRecord.serviceType}</div>
                          <div className="flex items-center gap-2"><Gauge className="w-3 h-3" /> {v.topMaintenanceRecord.lastOdometerReading?.toLocaleString()} km</div>
                          <div className="flex items-center gap-2"><Calendar className="w-3 h-3" /> {v.topMaintenanceRecord.daysLate}d late</div>
                        </>
                      )}
                    </div>
                    <div className="pt-2" style={{ borderTop: '1px solid rgba(99,102,241,0.08)' }}>
                      <span className="badge" style={{ background: `${v.urgencyColor || '#10b981'}12`, color: v.urgencyColor || '#10b981', border: `1px solid ${v.urgencyColor || '#10b981'}20` }}>
                        {v.urgencyLevel || 'healthy'}
                      </span>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        )}

        {vehicles.length === 0 && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-[1000] pointer-events-none">
            <div className="glass-card p-10 text-center pointer-events-auto max-w-sm">
              <div className="empty-state-icon mx-auto" style={{ background: 'rgba(245,158,11,0.06)' }}>
                <AlertTriangle className="w-7 h-7 text-amber-500/60" />
              </div>
              <p className="font-bold text-base mt-4">No Vehicle Data</p>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                GTFS feed is configured but returned no vehicles. The feed may be temporarily unavailable or buses may not be operating right now.
              </p>
            </div>
          </div>
        )}

        {/* Vehicle count badge */}
        {vehicles.length > 0 && (
          <div className="absolute top-4 left-4 z-[1000]">
            <div className="px-4 py-2 rounded-xl text-xs font-bold"
              style={{ background: 'rgba(5,8,15,0.8)', backdropFilter: 'blur(12px)', border: '1px solid rgba(99,102,241,0.1)', color: '#818cf8' }}>
              {vehicles.length} vehicles tracked
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
