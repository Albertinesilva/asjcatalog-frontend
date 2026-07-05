import { Outlet } from "react-router-dom";
import { Navbar } from "@/components";
import imageBackground from "@/assets/auth_image.png";

/**
 * AuthLayout — Fase 10.3.
 *
 * Split layout moderno: hero institucional à esquerda, slot de formulário
 * (páginas de auth) à direita. Formulários e fluxos permanecem intocados
 * — apenas o container foi migrado para Tailwind + tokens.
 */
export default function AuthLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <div className="flex-1 w-full mx-auto max-w-[1200px] px-md py-xl lg:px-xl lg:py-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl lg:gap-2xl items-center">
          <section className="flex flex-col gap-md max-w-[520px] mx-auto lg:mx-0">
            <h1 className="font-heading text-h1 lg:text-display text-foreground m-0">
              Gerencie seu catálogo com o ASJ Catalog
            </h1>
            <p className="text-body-lg text-foreground-muted m-0">
              Acesse sua conta para administrar produtos, categorias e usuários em um ambiente
              centralizado e profissional.
            </p>
            <img
              src={imageBackground}
              alt="Ilustração da plataforma ASJ Catalog"
              className="w-full max-w-[460px] h-auto mt-md"
              loading="lazy"
            />
          </section>
          <section className="w-full flex justify-center lg:justify-end">
            <Outlet />
          </section>
        </div>
      </div>
    </div>
  );
}
