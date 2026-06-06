import { Outlet } from "react-router-dom";
import { Navbar } from "@/components";

export default function CatalogLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}