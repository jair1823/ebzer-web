import "./App.css";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { AgendaPage, ExpensesPage, IncomesPage, OrderStatusesPage, OrdersPage } from "./pages";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { ThemeToggle } from "./components";
import { ProtectedRoute, RequireRole } from "./auth";
import { LoginPage } from "./pages/auth/LoginPage";
import { UsersPage } from "./pages";
import { CreateOrderForm } from "./pages/orders/CreateOrderForm";

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
            element: <Navigate to="/orders" replace />,
          },
          {
            path: "orders",
            element: <OrdersPage />,
          },
          {
            path: "orders/new",
            element: <CreateOrderForm />,
          },
          {
            path: "orders/:id/edit",
            element: <CreateOrderForm />,
          },
          {
            path: "agenda",
            element: <AgendaPage />,
          },
          {
            path: "incomes",
            element: <IncomesPage />,
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
