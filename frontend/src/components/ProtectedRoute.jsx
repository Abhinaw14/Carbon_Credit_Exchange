import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ children, requiredRole }) {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) return <LoadingSpinner text="Loading..." />;

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && user?.role !== requiredRole) {
        return (
            <div className="text-center py-20 animate-fade-in">
                <div className="text-5xl mb-4">🔒</div>
                <h2 className="text-2xl font-bold text-text mb-2">Access Denied</h2>
                <p className="text-text-muted">You need <span className="text-warning font-semibold">{requiredRole}</span> permissions to access this page.</p>
            </div>
        );
    }

    return children;
}
