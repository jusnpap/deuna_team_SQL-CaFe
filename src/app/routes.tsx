import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Billetera } from "./pages/Billetera";
import { Beneficios } from "./pages/Beneficios";
import { Profile } from "./pages/Profile";
import { Transfer } from "./pages/Transfer";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "billetera", Component: Billetera },
      { path: "beneficios", Component: Beneficios },
      { path: "tu", Component: Profile },
      { path: "transferir", Component: Transfer },
    ],
  },
]);
