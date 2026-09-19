import { Navigate, Outlet, useLocation } from 'react-router-dom';

const getSession = () => {
  const token = localStorage.getItem('leadyfy_token');
  const rawUser = localStorage.getItem('leadyfy_user');

  if (!token || !rawUser) return null;

  try {
    return { token, user: JSON.parse(rawUser) };
  } catch {
    return null;
  }
};

export default function ProtectedRoute({ allowedRoles, redirectTo }) {
  const location = useLocation();
  const session = getSession();

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(session.user.role)) {
    return <Navigate to={redirectTo || (session.user.role === 'Client' ? '/portal' : '/')} replace />;
  }

  return <Outlet context={session} />;
}

export { getSession };
