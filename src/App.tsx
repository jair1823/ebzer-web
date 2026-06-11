import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AgendaPage, ExpensesPage, OrderStatusesPage, OrdersPage } from "./pages";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { ThemeToggle } from "./components";
import { ProtectedRoute, RequireRole } from "./auth";
import { LoginPage } from "./pages/auth/LoginPage";
import { UsersPage } from "./pages";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <OrdersPage />,
          },
          {
            path: "agenda",
            element: <AgendaPage />,
          },
          {
            path: "expenses",
            element: <ExpensesPage />,
          },
          {
            path: "settings/statuses",
            element: <OrderStatusesPage />,
          },
          {
            element: <RequireRole role="admin" />,
            children: [
              {
                path: "settings/users",
                element: <UsersPage />,
              },
            ],
          },
        ],
      },
    ],
  },
]);

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <ThemeToggle />
    </>
  );
}

export default App;
