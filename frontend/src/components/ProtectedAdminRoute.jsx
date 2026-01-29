import { Navigate, Outlet } from 'react-router-dom';

const ProtectedAdminRoute = () => {
    const token = localStorage.getItem('adminToken');
    const userStr = localStorage.getItem('adminUser');

    // Basic check: Token must exist. 
    // You could also verify if user is actually an admin by decoding token, 
    // but the backend API calls will fail anyway if token is invalid.
    if (!token || !userStr) {
        return <Navigate to="/sse/educode" replace />;
    }

    return <Outlet />;
};

export default ProtectedAdminRoute;
