import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { AnimatePresence, motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { gtfsApi } from '../api/client';
import PageContainer from '../components/ui/PageContainer';
import DashboardCard from '../components/ui/DashboardCard';
import SectionHeader from '../components/ui/SectionHeader';
import StatusBadge from '../components/ui/StatusBadge';

const LEGEND = [
  { color: '#22c55e', text: 'Green -> Healthy' },
  { color: '#eab308', text: 'Yellow -> Approaching service' },
  { color: '#f97316', text: 'Orange -> Due soon' },
  { color: '#ef4444', text: 'Red -> Overdue' },
];

export default function FleetMap() {
  const [hoveredVehicle, setHoveredVehicle] = useState(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['gtfs-vehicles'],
    queryFn: gtfsApi.getVehicles,
    refetchInterval: 30000,
  });

  const vehicles = data?.data || [];
  const defaultCenter = [42.3601, -71.0589];
  const center = vehicles.length
    ? [vehicles[0].latitude, vehicles[0].longitude]
    : defaultCenter;

  return (
    <PageContainer
      title="Fleet Map"
      subtitle="Live map of vehicles with maintenance urgency overlay"
      actions={(
        <button className="btn btn-secondary" onClick={() => refetch()}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <RefreshCw size={14} />
            Refresh
          </span>
        </button>
      )}
    >
      <DashboardCard className="map-shell">
        <SectionHeader title="Fleet Position Map" />
        <div className="legend-row">
          {LEGEND.map((item) => (
            <div key={item.text} className="legend-item">
              <span className="dot" style={{ background: item.color }} />
              <span>{item.text}</span>
            </div>
          ))}
        </div>

        <div className="map-frame" style={{ position: 'relative' }}>
          {isLoading ? (
            <p className="card-muted">Loading live vehicles...</p>
          ) : (
            <MapContainer center={center} zoom={12}>
              <TileLayer
                attribution='&copy; <a href="https://carto.com">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              {vehicles.map((vehicle, index) => {
                const color = vehicle.urgencyColor || '#22c55e';
                const identifier = vehicle.bus?.busNumber || vehicle.label || `Vehicle ${index + 1}`;
                return (
                  <CircleMarker
                    key={`${identifier}-${index}`}
                    center={[vehicle.latitude, vehicle.longitude]}
                    radius={hoveredVehicle === identifier ? 10 : 7}
                    pathOptions={{
                      color,
                      fillColor: color,
                      fillOpacity: 0.88,
                      weight: hoveredVehicle === identifier ? 3 : 2,
                    }}
                    eventHandlers={{
                      mouseover: () => setHoveredVehicle(identifier),
                      mouseout: () => setHoveredVehicle(null),
                    }}
                  >
                    <Popup>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <strong>{identifier}</strong>
                        <StatusBadge value={vehicle.urgencyLevel || 'Healthy'} />
                        <span style={{ fontSize: 12 }}>Urgency score: {vehicle.urgencyScore || 0}</span>
                        {vehicle.topMaintenanceRecord ? (
                          <span style={{ fontSize: 12 }}>
                            Service: {vehicle.topMaintenanceRecord.serviceType || 'N/A'}
                          </span>
                        ) : null}
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          )}

          <AnimatePresence>
            {hoveredVehicle ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.16 }}
                style={{
                  position: 'absolute',
                  bottom: 24,
                  left: 24,
                  background: 'rgba(15,23,42,0.92)',
                  border: '1px solid rgba(148,163,184,0.3)',
                  borderRadius: 12,
                  padding: '12px 16px',
                }}
              >
                Marker hover: <strong>{hoveredVehicle}</strong>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </DashboardCard>
    </PageContainer>
  );
}
