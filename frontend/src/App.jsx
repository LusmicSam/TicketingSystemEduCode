import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Analytics } from "@vercel/analytics/react"
import TicketForm from './pages/Client/TicketForm';
import Dashboard from './pages/Admin/Dashboard';
import AdminLogin from './pages/Admin/Login';
import { ThemeProvider } from './components/ThemeContext';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';

function App() {
  return (
    <ThemeProvider>
      <Analytics />
      <Router>
        <div className="min-h-screen theme-bg theme-text font-sans transition-colors duration-300">
          <Routes>
            <Route path="/" element={<TicketForm />} />

            {/* Obscure Admin Login */}
            <Route path="/sse/educode" element={<AdminLogin />} />

            {/* Protected Dashboard Route */}
            <Route element={<ProtectedAdminRoute />}>
              <Route path="/sse/educode/ad/min/dashboard" element={<Dashboard />} />
            </Route>

            {/* Catch-all or Legacy Redirect */}
            <Route path="/admin" element={<TicketForm />} />
            <Route path="/admin/*" element={<TicketForm />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
