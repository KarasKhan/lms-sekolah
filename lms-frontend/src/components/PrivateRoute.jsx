import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute({ children }) {
  const { token } = useAuth();
  
  // Jika tidak ada token, tendang ke login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}