import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/Layout';
import ExecutiveDashboard from './pages/ExecutiveDashboard';
import Clients from './pages/Clients';
import ClientPortal from './pages/ClientPortal';
import Financials from './pages/Financials';
import Login from './pages/Login';
import Orders from './pages/Orders';
import Register from './pages/Register';
import VideoPipeline from './pages/VideoPipeline';

function Placeholder({ title }) {
  return <div className="border border-line bg-panel p-8"><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-amber">Leadyfy OS</p><h1 className="mt-3 text-2xl font-semibold">{title}</h1><p className="mt-2 text-sm text-muted">This workspace is ready for the next module.</p></div>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route element={<ProtectedRoute allowedRoles={['Owner', 'Admin', 'ShootManager', 'Operations Manager']} />}>
            <Route index element={<ExecutiveDashboard />} />
            <Route path="clients" element={<Clients />} />
            <Route path="orders" element={<Orders />} />
            <Route path="scripts" element={<Placeholder title="Script desk" />} />
            <Route path="creators" element={<Placeholder title="Creator hub" />} />
            <Route path="shoots" element={<Placeholder title="Shoot calendar" />} />
            <Route path="videos" element={<VideoPipeline />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['Owner', 'Admin']} />}>
            <Route path="finance" element={<Financials />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['Client']} />}>
            <Route path="portal" element={<ClientPortal />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['Client', 'Owner', 'Admin']} />}>
            <Route path="support" element={<Placeholder title="Support inbox" />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['Client', 'Owner', 'Admin', 'ShootManager', 'Operations Manager']} />}>
            <Route path="settings" element={<Placeholder title="Settings" />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
