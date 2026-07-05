import { Outlet } from "react-router-dom";
import { Navbar } from "@/components";

/**
 * CatalogLayout — Fase 10.3.
 *
 * Estrutura pública mínima com container padronizado e superfície
 * em `bg-background`. As páginas internas continuam responsáveis
 * pela sua própria composição visual (serão migradas na Fase 10.4).
 */
export default function CatalogLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
