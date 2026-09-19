import { Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Navbar } from "@/components";
import authLoginImage from "@/assets/auth/auth-login-products.jpg";
import authRegisterImage from "@/assets/auth/auth-register-products.jpg";
import authRecoverImage from "@/assets/auth/auth-recover-products.jpg";
import authActivateImage from "@/assets/auth/auth-activate-products.jpg";

/** Mapeamento puramente visual: rota do fluxo de auth -> imagem hero. */
const AUTH_HERO_BY_PATH: Record<string, string> = {
  "/auth/login": authLoginImage,
  "/login": authLoginImage,
  "/auth/register": authRegisterImage,
  "/auth/recover": authRecoverImage,
  "/forgot-password": authRecoverImage,
  "/auth/reset-password": authRecoverImage,
  "/reset-password": authRecoverImage,
  "/auth/activation-pending": authActivateImage,
  "/activation-pending": authActivateImage,
  "/activate-account": authActivateImage,
};

/**
 * AuthLayout — Fase 10.3.
 *
 * Split layout moderno: hero institucional à esquerda, slot de formulário
 * (páginas de auth) à direita. Formulários e fluxos permanecem intocados
 * — apenas o container foi migrado para Tailwind + tokens.
 */
export default function AuthLayout() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const heroImage = AUTH_HERO_BY_PATH[pathname] ?? authLoginImage;
  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <Navbar />
      <main className="flex-1 w-full mx-auto max-w-page px-md py-xl lg:px-xl lg:py-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl lg:gap-2xl items-center">
          <section className="flex flex-col gap-md max-w-[520px] mx-auto lg:mx-0">
            <h1 className="font-heading text-h1 lg:text-display text-foreground m-0">
              {t("home:authHero.title")}
            </h1>
            <p className="text-body-lg text-foreground-muted m-0">
              {t("home:authHero.description")}
            </p>
            <img
              src={heroImage}
              alt=""
              aria-hidden="true"
              width={1200}
              height={1200}
              className="w-full max-w-[460px] h-auto mt-md rounded-lg"
              loading="lazy"
            />
          </section>
          <section className="w-full flex justify-center lg:justify-end">
            <Outlet />
          </section>
        </div>
      </main>
    </div>
  );
}
