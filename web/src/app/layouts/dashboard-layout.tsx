import type { ComponentType } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, LogOut, PhoneCall, User, UserPlus } from "lucide-react";
import { useAuth } from "@/app/providers";
import { cn } from "@/shared/utils/cn";

interface NavItem {
  name: string;
  to: string;
  icon: ComponentType<{ className?: string }>;
}

function SidebarBrand() {
  return (
    <div className="flex items-center gap-3 px-1 md:px-2">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <PhoneCall className="h-5 w-5" />
      </span>
      <span className="hidden truncate text-base font-bold tracking-tight text-foreground md:inline">
        Apex Sales Call
      </span>
    </div>
  );
}

function SidebarLink({ item }: { item: NavItem }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      end={item.to === "/"}
      title={item.name}
      className={({ isActive }) =>
        cn(
          "flex items-center justify-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors md:justify-start",
          isActive
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-foreground hover:bg-muted"
        )
      }
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span className="hidden truncate md:inline">{item.name}</span>
    </NavLink>
  );
}

interface SidebarLogoutProps {
  onLogout: () => void;
}

function SidebarLogout({ onLogout }: SidebarLogoutProps) {
  return (
    <button
      type="button"
      onClick={onLogout}
      title="Log out"
      className="flex w-full items-center justify-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted md:justify-start"
    >
      <LogOut className="h-5 w-5 shrink-0" />
      <span className="hidden truncate md:inline">Log out</span>
    </button>
  );
}

export function DashboardLayout() {
  const { logout } = useAuth();

  const navItems: NavItem[] = [
    { name: "Dashboard", to: "/", icon: LayoutDashboard },
    { name: "Leads", to: "/leads", icon: UserPlus },
    { name: "Accounts", to: "/accounts", icon: User },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 flex h-screen w-16 shrink-0 flex-col border-r bg-card p-2 md:w-60 md:p-3">
        <SidebarBrand />
        <span className="mt-6 hidden px-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground md:block">
          MENU
        </span>
        <nav className="mt-2 flex flex-col gap-1 md:mt-1">
          {navItems.map((item: NavItem) => (
            <SidebarLink key={item.to} item={item} />
          ))}
        </nav>
        <div className="mt-auto">
          <SidebarLogout onLogout={logout} />
        </div>
      </aside>
      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  );
}
