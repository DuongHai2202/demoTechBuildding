import { Navigate, Outlet } from 'react-router-dom';

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

  // Guest flow: If user only has GUEST role and is not already on /pending-approval
  const isOnlyGuest = user?.roles?.length === 1 && user.roles[0] === 'GUEST';
  const isAtPendingPage = window.location.pathname === '/pending-approval';

  if (isOnlyGuest && !isAtPendingPage) {
    return <Navigate to="/pending-approval" replace />;
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
