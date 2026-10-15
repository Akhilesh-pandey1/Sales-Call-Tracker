import { createBrowserRouter, Navigate } from "react-router-dom";
import { DashboardLayout } from "@/app/layouts/dashboard-layout";
import { ManagerGuard } from "@/app/guards/manager-guard";
import { LoginPage } from "@/features/auth";
import { TeamPage, PersonPage } from "@/features/dashboard";
import { LeadsPage } from "@/features/leads";
import { AccountsPage } from "@/features/accounts";

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
