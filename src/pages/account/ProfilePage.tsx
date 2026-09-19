import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Card, buttonClasses } from "@/components/ui";
import personalImage from "@/assets/account/profile-personal.jpg";
import securityImage from "@/assets/account/profile-security.jpg";

/**
 * ProfilePage — /account/profile.
 * Tela de entrada do "Meu Perfil": apenas seleção das seções
 * (Dados pessoais e Segurança). Sem formulários e sem chamadas de API.
 */
type Section = {
  key: string;
  to: string;
  title: string;
  description: string;
  action: string;
  image: string;
  alt: string;
};

export default function ProfilePage() {
  const { t } = useTranslation();

  const sections: Section[] = [
    {
      key: "personal",
      to: "/account/profile/personal",
      title: t("profile:sections.personal"),
      description: t("profile:hub.personalDescription"),
      action: t("profile:hub.personalAction"),
      image: personalImage,
      alt: t("profile:hub.personalImageAlt"),
    },
    {
      key: "security",
      to: "/account/profile/security",
      title: t("profile:sections.security"),
      description: t("profile:hub.securityDescription"),
      action: t("profile:hub.securityAction"),
      image: securityImage,
      alt: t("profile:hub.securityImageAlt"),
    },
  ];

  return (
    <div className="flex w-full max-w-4xl flex-col gap-md">
      <p className="m-0 text-small text-foreground-muted">{t("profile:hub.intro")}</p>

      <div className="grid grid-cols-1 gap-md lg:grid-cols-2">
        {sections.map((section) => (
          <Card key={section.key} padding="md" className="flex min-w-0 flex-col gap-sm">
            <div className="overflow-hidden rounded-md bg-surface-hover">
              <img
                src={section.image}
                alt={section.alt}
                loading="lazy"
                width={1200}
                height={800}
                className="h-36 w-full object-cover sm:h-40"
              />
            </div>
            <div className="flex flex-col gap-0.5">
              <h2 className="m-0 font-heading text-title text-foreground">{section.title}</h2>
              <p className="m-0 text-small text-foreground-muted">{section.description}</p>
            </div>
            <div className="mt-auto flex justify-end pt-1">
              <Link
                to={section.to}
                className={`${buttonClasses("primary", "md")} w-full sm:w-auto`}
              >
                {section.action}
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
