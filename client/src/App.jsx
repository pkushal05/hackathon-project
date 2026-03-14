import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import FleetMap from './pages/FleetMap';
import Buses from './pages/Buses';
import Maintenance from './pages/Maintenance';
import Parts from './pages/Parts';
import Services from './pages/Services';
import Forecast from './pages/Forecast';
import SettingsPage from './pages/Settings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 30000 },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/fleet-map" element={<FleetMap />} />
            <Route path="/buses" element={<Buses />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/parts" element={<Parts />} />
            <Route path="/services" element={<Services />} />
            <Route path="/forecast" element={<Forecast />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
