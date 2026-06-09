import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { OrdersPage, ExpensesPage } from "./pages";
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
