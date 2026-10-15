import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/app/providers";
import { Button } from "@/components/ui/button";

export function ManagerGuard() {
  const { isAuthenticated, isManager, logout } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleLogoutClick = () => {
    logout();
  };

  if (!isManager) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
        <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground">Access Restricted</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This dashboard is for managers.
          </p>
          <div className="mt-6">
            <Button variant="outline" onClick={handleLogoutClick}>
              Log Out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
