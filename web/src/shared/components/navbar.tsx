import { LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/app/providers";

export function Navbar() {
  const { user, logout } = useAuth();

  const handleLogoutClick = () => {
    logout();
  };

  const defaultName: string = "Manager";
  const displayName: string = user?.name || defaultName;
  const defaultRole: string = "Manager";
  const userRole: string = user?.role || defaultRole;
  const defaultCountry: string = "IN";
  const userCountry: string = user?.country || defaultCountry;

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b bg-background px-4 sm:px-6">
      <div className="flex items-center space-x-3">
        <h1 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
          Apex Sales Call Tracker
        </h1>
      </div>
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UserIcon className="h-4 w-4" />
          </div>
          <div className="hidden flex-col sm:flex">
            <span className="text-sm font-medium text-foreground">{displayName}</span>
            <span className="text-xs text-muted-foreground capitalize">
              {userRole}
            </span>
          </div>
          <Badge variant="outline" className="hidden md:inline-flex">
            {userCountry}
          </Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogoutClick}
          className="flex items-center gap-1.5"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}
