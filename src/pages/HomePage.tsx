import { Link } from "react-router-dom";
import { Badge, Button, Card } from "@/components/ui";
import homeImage from "@/assets/home-illustration.jpg";

/**
 * HomePage — Fase 10.4.
 *
 * Landing modernizada em Tailwind + Design System. Conteúdo institucional
 * (Fase 9) e navegação preservados. Sem Bootstrap, sem CSS Module.
 */
const features = [
  {
    title: "Catálogo centralizado",
    description:
      "Organize produtos, categorias e informações comerciais em um único lugar.",
  },
  {
    title: "Administração simplificada",
    description:
      "Cadastre, edite e mantenha o catálogo com uma experiência clara e consistente.",
  },
  {
    title: "Controle de usuários",
    description: "Defina permissões e gerencie o acesso da sua equipe com segurança.",
  },
];

export default function HomePage() {
  return (
    <div className="w-full mx-auto max-w-[1200px] px-md py-xl lg:px-xl lg:py-2xl">
      <Card padding="none" elevated bordered className="overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-xl px-md py-xl lg:px-2xl lg:py-2xl">
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-md">
            <Badge variant="outline" className="uppercase tracking-wider">
              ASJ Catalog · Plataforma
            </Badge>
            <h1 className="font-heading text-h1 lg:text-display text-foreground m-0">
              Gestão profissional de catálogos
            </h1>
            <p className="text-body-lg text-foreground-muted m-0 max-w-[46ch]">
              Plataforma profissional para gestão e organização de catálogos de produtos, com
              controle centralizado e administração simplificada.
            </p>
            <div className="flex flex-wrap gap-sm mt-sm">
              <Link to="/catalog">
                <Button size="lg" variant="primary">
                  Acessar catálogo
                </Button>
              </Link>
              <Link to="/auth/login">
                <Button size="lg" variant="outline">
                  Entrar
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center lg:justify-end">
            <img
              src={homeImage}
              alt="Interface do catálogo digital ASJ Catalog com produtos e métricas"
              width={1200}
              height={1024}
              fetchPriority="high"
              className="w-full max-w-[520px] h-auto rounded-lg"
            />
          </div>
        </div>
      </Card>

      <section
        aria-label="Recursos da plataforma"
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
