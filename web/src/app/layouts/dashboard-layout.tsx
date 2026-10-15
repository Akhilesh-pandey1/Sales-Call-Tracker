import type { ComponentType } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, PhoneCall, Users } from "lucide-react";
import { Navbar } from "@/shared/components/navbar";
import { cn } from "@/shared/utils/cn";

interface NavItem {
  name: string;
  to: string;
  icon: ComponentType<{ className?: string }>;
}

export function DashboardLayout() {
  const navItems: NavItem[] = [
    { name: "Dashboard", to: "/", icon: LayoutDashboard },
    { name: "Leads", to: "/leads", icon: PhoneCall },
    { name: "Accounts", to: "/accounts", icon: Users },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <div className="flex flex-1">
        <aside className="w-56 border-r bg-muted/20 sm:w-64">
          <nav className="flex flex-col space-y-1 p-3 sm:p-4">
            {navItems.map((item: NavItem) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
