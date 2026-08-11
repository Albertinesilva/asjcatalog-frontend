import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Badge, Button, Card } from "@/components/ui";
import ProductShowcase from "@/components/ProductShowcase";

/**
 * HomePage — Fase 10.4.
 *
 * Landing modernizada em Tailwind + Design System. Conteúdo institucional
 * (Fase 9) e navegação preservados. Sem Bootstrap, sem CSS Module.
 */
export default function HomePage() {
  const { t } = useTranslation();
  const features = [
    {
      title: t("home:features.centralized.title"),
      description: t("home:features.centralized.description"),
    },
    { title: t("home:features.admin.title"), description: t("home:features.admin.description") },
    { title: t("home:features.users.title"), description: t("home:features.users.description") },
  ];
  return (
    <div className="w-full mx-auto max-w-[1200px] px-md py-xl lg:px-xl lg:py-2xl">
      <Card padding="none" elevated bordered className="overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-2xl px-md py-xl lg:px-2xl lg:py-2xl">
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-md">
            <Badge variant="outline" className="uppercase tracking-wider">
              {t("home:badge")}
            </Badge>
            <h1 className="font-heading text-h1 lg:text-display text-foreground m-0">
              {t("home:title")}
            </h1>
            <p className="text-body-lg text-foreground-muted m-0 max-w-[46ch]">
              {t("home:description")}
            </p>
            <div className="flex flex-wrap gap-sm mt-sm">
              <Link to="/catalog">
                <Button size="lg" variant="primary">
                  {t("home:cta.catalog")}
                </Button>
              </Link>
              <Link to="/auth/login">
                <Button size="lg" variant="outline">
                  {t("home:cta.login")}
                </Button>
              </Link>
            </div>
          </div>
          <div className="order-last w-full min-w-0">
            <ProductShowcase className="lg:ml-auto" />
          </div>
        </div>
      </Card>

      <section
        aria-label={t("home:features.sectionLabel")}
        className="mt-xl grid grid-cols-1 md:grid-cols-3 gap-md"
      >
        {features.map((f) => (
          <Card key={f.title} padding="lg" elevated={false} bordered>
            <h3 className="font-heading text-title text-foreground m-0">{f.title}</h3>
            <p className="mt-xs text-body text-foreground-muted m-0">{f.description}</p>
          </Card>
        ))}
      </section>
    </div>
  );
}
