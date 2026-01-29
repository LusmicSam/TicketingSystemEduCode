import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TicketForm from './pages/Client/TicketForm';
import Dashboard from './pages/Admin/Dashboard';
import AdminLogin from './pages/Admin/Login';

import ProtectedAdminRoute from './components/ProtectedAdminRoute';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        <Routes>
          <Route path="/" element={<TicketForm />} />

          {/* Obscure Admin Login */}
          <Route path="/sse/educode" element={<AdminLogin />} />

          {/* Protected Dashboard Route */}
          <Route element={<ProtectedAdminRoute />}>
            <Route path="/sse/educode/ad/min/dashboard" element={<Dashboard />} />
          </Route>

          {/* Catch-all or Legacy Redirect (Optional: Send them back to student form or 404) */}
          <Route path="/admin" element={<TicketForm />} />
          <Route path="/admin/*" element={<TicketForm />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
