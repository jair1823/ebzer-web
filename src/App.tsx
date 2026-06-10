import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AgendaPage, ExpensesPage, OrderStatusesPage, OrdersPage } from "./pages";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { ThemeToggle } from "./components";

const router = createBrowserRouter([
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
