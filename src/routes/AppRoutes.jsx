import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import Dashboard from '../layouts/DashboardLayout';
// import DashboardLayout from '../layouts/DashboardLayout';
// import DashboardHome from '../pages/Dashboard/DashboardHome';
// import Analytics from '../pages/Dashboard/Analytics';
// import Settings from '../pages/Dashboard/Settings';
// import NotFound from '../pages/NotFound';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login/>}/>
        <Route path="/dashboard" element={<Dashboard/>} />
        {/* <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<NotFound />} /> */}
      </Routes>
    </BrowserRouter>
  );
}
