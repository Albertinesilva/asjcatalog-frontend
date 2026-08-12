import { useEffect, useRef, useState, type ComponentType, type SVGProps } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useRoles } from "@/hooks/useRoles";
import { cn } from "@/components/ui";

/**
 * Sidebar — Fase 10.3.
 *
 * Navegação lateral SaaS moderna. Desktop: coluna fixa com itens
 * arredondados, indicador de ativo e ícones. Mobile/tablet: barra
 * horizontal de chips com rolagem suave. Sem Bootstrap. Sem CSS Module.
 * Permissões e destinos originais preservados integralmente.
 */

type IconProps = SVGProps<SVGSVGElement>;

const DashboardIcon = (props: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="3" y="3" width="7" height="9" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" />
    <rect x="3" y="16" width="7" height="5" rx="1.5" />
  </svg>
);
const BoxIcon = (props: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
    <path d="m3 8 9 5 9-5" />
    <path d="M12 13v8" />
  </svg>
);
const TagIcon = (props: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M20 12 12 20l-8-8V4h8l8 8Z" />
    <circle cx="8" cy="8" r="1.5" />
  </svg>
);
const UsersIcon = (props: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const UserIcon = (props: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const StoreIcon = (props: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M3 9 4.5 4h15L21 9" />
    <path d="M4 9v11h16V9" />
    <path d="M9 20v-6h6v6" />
  </svg>
);
const ShieldIcon = (props: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z" />
    <path d="M12 11v3" />
    <circle cx="12" cy="9" r="1" />
  </svg>
);
const ChevronDownIcon = (props: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

type Item = {
  to: string;
  label: string;
  icon: ComponentType<IconProps>;
  end?: boolean;
};

const linkBase =
  "group inline-flex items-center gap-sm rounded-md transition-colors duration-DEFAULT ease-standard " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

/** Chip variant used on mobile/tablet; pill variant used on desktop. */
function itemClassName({ isActive, spread }: { isActive: boolean; spread?: boolean }) {
  return cn(
    linkBase,
    // Mobile / tablet: pill chip.
    "shrink-0 whitespace-nowrap px-md py-sm text-small font-heading font-semibold",
    "lg:w-full lg:px-md lg:py-sm lg:text-body lg:relative",
    spread ? "lg:justify-between" : "lg:justify-start",
    isActive
      ? "bg-primary/10 text-primary lg:before:content-[''] lg:before:absolute lg:before:left-0 lg:before:top-1.5 lg:before:bottom-1.5 lg:before:w-1 lg:before:rounded-full lg:before:bg-primary"
      : "bg-transparent text-foreground-muted hover:bg-surface-hover hover:text-foreground",
  );
}

export default function Sidebar() {
  const { t } = useTranslation();
  const { isAdmin } = useRoles();
  const { pathname } = useLocation();
  const inProfileArea = pathname.startsWith("/account/profile");
  const [profileOpen, setProfileOpen] = useState(inProfileArea);
  const previousInProfileArea = useRef(inProfileArea);

  // Sincroniza apenas quando o usuário ENTRA na área de perfil vindo de fora.
  // Nunca sobrescreve um toggle manual feito pelo usuário na mesma rota.
  useEffect(() => {
    if (inProfileArea && !previousInProfileArea.current) setProfileOpen(true);
    previousInProfileArea.current = inProfileArea;
  }, [inProfileArea]);

  const topItems: Item[] = [
    { to: "/dashboard", label: t("navigation:sidebar.dashboard"), icon: DashboardIcon, end: true },
    { to: "/dashboard/products", label: t("navigation:sidebar.products"), icon: BoxIcon },
    { to: "/dashboard/categories", label: t("navigation:sidebar.categories"), icon: TagIcon },
    ...(isAdmin
      ? [{ to: "/dashboard/users", label: t("navigation:sidebar.users"), icon: UsersIcon }]
      : []),
  ];

  const profileChildren: Item[] = [
    {
      to: "/account/profile/personal",
      label: t("navigation:sidebar.profilePersonal"),
      icon: UserIcon,
    },
    {
      to: "/account/profile/security",
      label: t("navigation:sidebar.profileSecurity"),
      icon: ShieldIcon,
    },
  ];

  const bottomItems: Item[] = [
    { to: "/catalog", label: t("navigation:sidebar.publicCatalog"), icon: StoreIcon },
  ];

  return (
    <aside
      aria-label={t("navigation:sidebar.label")}
      className={cn(
        "w-full bg-surface border-b border-border",
        "lg:w-[260px] lg:shrink-0 lg:border-b-0 lg:border-r lg:border-border",
        "lg:sticky lg:top-[70px] lg:self-start lg:h-[calc(100vh-70px)]",
      )}
    >
      <nav className="h-full">
        <ul
          className={cn(
            "flex flex-row items-center gap-sm p-sm overflow-x-auto",
            "lg:flex-col lg:items-stretch lg:gap-xs lg:p-md lg:overflow-visible",
          )}
        >
          {topItems.map((item) => (
            <li key={item.to} className="lg:w-full">
              <NavLink to={item.to} end={item.end} className={itemClassName}>
                <item.icon width={18} height={18} aria-hidden className="shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}

          <li className="contents lg:block lg:w-full">
            <button
              type="button"
              onClick={() => setProfileOpen((open) => !open)}
              aria-expanded={profileOpen}
              aria-controls="sidebar-profile-submenu"
              className={cn(
                itemClassName({ isActive: profileOpen || inProfileArea, spread: true }),
                "cursor-pointer",
              )}
            >
              <span className="inline-flex items-center gap-sm">
                <UserIcon width={18} height={18} aria-hidden className="shrink-0" />
                <span>{t("navigation:sidebar.profile")}</span>
              </span>
              <ChevronDownIcon
                width={16}
                height={16}
                aria-hidden
                className={cn(
                  "shrink-0 transition-transform duration-DEFAULT ease-standard",
                  profileOpen ? "rotate-180" : "rotate-0",
                )}
              />
            </button>
            <div
              className={cn(
                "lg:overflow-hidden lg:transition-all lg:duration-DEFAULT lg:ease-standard",
                profileOpen
                  ? "contents lg:block lg:max-h-40 lg:opacity-100"
                  : "hidden lg:block lg:max-h-0 lg:opacity-0 lg:invisible",
              )}
            >
              <ul
                id="sidebar-profile-submenu"
                className="contents lg:mt-xs lg:flex lg:flex-col lg:gap-xs lg:pl-md lg:ml-sm lg:border-l lg:border-border"
              >
                {profileChildren.map((child) => (
                  <li key={child.to} className="lg:w-full">
                    <NavLink to={child.to} className={itemClassName}>
                      <child.icon width={16} height={16} aria-hidden className="shrink-0" />
                      <span>{child.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          </li>

          {bottomItems.map((item) => (
            <li key={item.to} className="lg:w-full">
              <NavLink to={item.to} end={item.end} className={itemClassName}>
                <item.icon width={18} height={18} aria-hidden className="shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
