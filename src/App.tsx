import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { OrdersPage, ExpensesPage, OrderStatusesPage } from "./pages";
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
