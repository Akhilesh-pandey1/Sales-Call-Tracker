import { createBrowserRouter, Navigate } from "react-router-dom";
import { DashboardLayout } from "@/app/layouts/dashboard-layout";
import { ManagerGuard } from "@/app/guards/manager-guard";
import { LoginPage } from "@/features/auth";
import { DashboardPage, PersonPage } from "@/features/dashboard";
import { TeamPage } from "@/features/team";
import { LeadsPage } from "@/features/leads";
import { AccountsPage } from "@/features/accounts";
import { SettingsPage } from "@/features/settings";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    element: <ManagerGuard />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            path: "/",
            element: <DashboardPage />,
          },
          {
            path: "/team",
            element: <TeamPage />,
          },
          {
            path: "/leads",
            element: <LeadsPage />,
          },
          {
            path: "/accounts",
            element: <AccountsPage />,
          },
          {
            path: "/settings",
            element: <SettingsPage />,
          },
          {
            path: "/person/:id",
            element: <PersonPage />,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
