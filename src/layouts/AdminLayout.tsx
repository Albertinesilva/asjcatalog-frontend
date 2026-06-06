import { Outlet } from "react-router-dom";
import { Navbar, Sidebar } from "@/components";

export default function AdminLayout() {
  return (
    <>
      <Navbar />
      <div className="d-flex flex-column flex-lg-row">
        <Sidebar />
        <div className="flex-grow-1">
          <Outlet />
        </div>
      </div>
    </>
  );
}