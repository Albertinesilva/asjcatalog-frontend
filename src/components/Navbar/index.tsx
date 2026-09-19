import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import NavbarLink from "../NavbarLink";
import { useAuth } from "@/hooks/useAuth";
import { useRoles } from "@/hooks/useRoles";
import { Button, cn } from "@/components/ui";
import LanguageSelector from "../LanguageSelector";
import logo from "@/assets/asj-logo.png";

/**
 * Navbar — Fase 10.3.
 *
 * Barra superior modernizada em Tailwind + tokens semânticos.
 * Sem Bootstrap; sem CSS Module. Comportamento (menu mobile, lock de
 * scroll, fechamento em navegação, logout) preservado integralmente.
 */
function getInitials(user: { firstName?: string; email?: string } | null | undefined): string {
  if (!user) return "?";
  const name = user.firstName?.trim();
  if (name) return name.charAt(0).toUpperCase();
  const email = user.email?.trim();
  return email ? email.charAt(0).toUpperCase() : "?";
}

export default function Navbar() {
  const { t } = useTranslation();
  const { authenticated, user, logout } = useAuth();
  const { isAdmin } = useRoles();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/");
  };

  const roleLabel = isAdmin ? t("navigation:roles.admin") : t("navigation:roles.operator");
  const greeting = user?.firstName
    ? t("navigation:greeting", { name: user.firstName })
    : (user?.email ?? "");

  return (
    <nav
      aria-label={t("navigation:mainNav")}
      className="sticky top-0 z-sticky bg-primary text-primary-foreground border-b border-primary-hover/40 backdrop-blur"
    >
      <div className="h-16 lg:h-[70px] px-md lg:px-xl flex items-center justify-between gap-md">
        {/* Brand */}
        <Link
          to="/"
          className="inline-flex items-center gap-sm font-heading text-body-lg text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/60 rounded-sm"
        >
          <img
            src={logo}
            alt=""
            aria-hidden
            width={32}
            height={32}
            className="w-8 h-8 drop-shadow-sm"
          />
          <span className="tracking-tight">
            <strong className="font-bold mr-1">ASJ</strong>Catalog
          </span>
        </Link>

        {/* Desktop menu */}
        <ul className="hidden lg:flex items-center gap-xl m-0 p-0 list-none">
          <li>
            <NavbarLink label={t("navigation:home")} target="/" />
          </li>
          <li>
            <NavbarLink label={t("navigation:catalog")} target="/catalog" />
          </li>
          <li>
            {authenticated ? (
              <NavbarLink label={t("navigation:dashboard")} target="/dashboard" />
            ) : (
              <NavbarLink label={t("navigation:login")} target="/auth/login" />
            )}
          </li>
        </ul>

        {/* Desktop user block */}
        <div className="hidden lg:flex items-center gap-md justify-end">
          <LanguageSelector variant="onPrimary" />
          {authenticated ? (
            <>
              <Link
                to="/account/profile"
                className="inline-flex items-center gap-sm rounded-md px-sm py-xs transition-colors ease-standard hover:bg-primary-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/60"
              >
                <span
                  aria-hidden
                  className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-foreground/15 text-primary-foreground font-heading font-semibold text-small"
                >
                  {getInitials(user)}
                </span>
                <span className="flex flex-col leading-tight">
                  <span className="text-small font-semibold text-primary-foreground truncate max-w-[160px]">
                    {greeting}
                  </span>
                  <span className="text-caption uppercase tracking-wider text-primary-foreground/70">
                    {roleLabel}
                  </span>
                </span>
              </Link>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-primary-foreground hover:bg-primary-foreground/10"
              >
                {t("navigation:logout")}
              </Button>
            </>
          ) : (
            <div aria-hidden className="w-[100px]" />
          )}
        </div>

        {/* Mobile toggle */}
        <div className="lg:hidden flex items-center gap-xs">
          <LanguageSelector variant="onPrimary" />
          <button
            type="button"
            aria-label={open ? t("navigation:closeMenu") : t("navigation:openMenu")}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex flex-col items-center justify-center gap-[5px] w-10 h-10 rounded-md bg-transparent border-0 cursor-pointer transition-colors ease-standard hover:bg-primary-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/60"
          >
            <span
              className={cn(
                "block w-6 h-0.5 rounded-full bg-primary-foreground transition-transform ease-standard",
                open && "translate-y-[7px] rotate-45",
              )}
            />
            <span
              className={cn(
                "block w-6 h-0.5 rounded-full bg-primary-foreground transition-opacity duration-fast ease-standard",
                open && "opacity-0",
              )}
            />
            <span
              className={cn(
                "block w-6 h-0.5 rounded-full bg-primary-foreground transition-transform ease-standard",
                open && "-translate-y-[7px] -rotate-45",
              )}
            />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <button
          type="button"
          aria-label={t("navigation:closeMenu")}
          onClick={() => setOpen(false)}
          className="lg:hidden fixed inset-0 z-overlay bg-overlay/40 border-0 p-0 cursor-default"
        />
      )}
      <div
        className={cn(
          "lg:hidden fixed left-0 right-0 top-16 z-overlay bg-primary text-primary-foreground shadow-lg border-t border-primary-hover/40",
          "flex-col gap-md px-md py-md",
          open ? "flex" : "hidden",
        )}
      >
        <ul className="flex flex-col m-0 p-0 list-none divide-y divide-primary-foreground/10">
          <li>
            <NavbarLink label={t("navigation:home")} target="/" />
          </li>
          <li className="pt-sm mt-sm">
            <NavbarLink label={t("navigation:catalog")} target="/catalog" />
          </li>
          <li className="pt-sm mt-sm">
            {authenticated ? (
              <NavbarLink label={t("navigation:dashboard")} target="/dashboard" />
            ) : (
              <NavbarLink label={t("navigation:login")} target="/auth/login" />
            )}
          </li>
        </ul>

        {authenticated && (
          <div className="flex items-center justify-between gap-sm pt-md border-t border-primary-foreground/10">
            <Link
              to="/account/profile"
              className="inline-flex items-center gap-sm rounded-md px-sm py-xs transition-colors ease-standard hover:bg-primary-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/60"
            >
              <span
                aria-hidden
                className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary-foreground/15 text-primary-foreground font-heading font-semibold text-small"
              >
                {getInitials(user)}
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-small font-semibold text-primary-foreground">{greeting}</span>
                <span className="text-caption uppercase tracking-wider text-primary-foreground/70">
                  {roleLabel}
                </span>
              </span>
            </Link>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-primary-foreground hover:bg-primary-foreground/10 border border-primary-foreground/30"
            >
              {t("navigation:logout")}
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}
