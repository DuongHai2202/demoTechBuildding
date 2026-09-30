import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuthStore } from '../features/auth/stores/authStore';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { hasPermission, type Permission } from '../features/auth/authorization';

interface RouteGuardProps {
  permission?: Permission;
}

export function ProtectedRoute({ permission }: RouteGuardProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const location = useLocation();

  if (!hasHydrated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSkeleton className="h-12 w-12 rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Guest flow: only a GUEST account may use the access-request screen. The
  // normalized comparison also handles older profiles that stored lowercase
  // role names.
  const normalizedRoles = (user?.roles ?? []).map((role) => String(role).toUpperCase());
  const isOnlyGuest = normalizedRoles.length === 1 && normalizedRoles[0] === 'GUEST';
  const isAtPendingPage = location.pathname === '/pending-approval';

  if (isOnlyGuest && !isAtPendingPage) {
    return <Navigate to="/pending-approval" replace />;
  }

  if (!isOnlyGuest && isAtPendingPage) {
    return <Navigate to="/" replace />;
  }

  if (permission && !hasPermission(user, permission)) {
    return <Navigate to="/forbidden" replace />;
  }

  return <Outlet />;
}

export function PermissionRoute({ permission }: { permission: Permission }) {
  const user = useAuthStore((s) => s.user);
  return hasPermission(user, permission) ? <Outlet /> : <Navigate to="/forbidden" replace />;
}
