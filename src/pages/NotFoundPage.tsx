import { Link } from "react-router-dom";
import { Button } from "@/components/ui";
import illustration from "@/assets/notfound-illustration.jpg";

export default function NotFoundPage() {
  return (
    <main className="mx-auto max-w-[720px] py-3xl px-md text-center flex flex-col items-center gap-md animate-fade-in">
      <img
        src={illustration}
        alt=""
        aria-hidden="true"
        width={1024}
        height={768}
        loading="lazy"
        className="w-full max-w-[420px] h-auto rounded-lg"
      />
      <h1 className="font-heading text-display text-primary m-0">404</h1>
      <p className="text-body text-foreground-muted m-0">
        A página solicitada não existe ou foi movida no ASJ Catalog.
      </p>
      <Link to="/">
        <Button variant="primary" size="lg">
          Voltar para o início
        </Button>
      </Link>
    </main>
  );
}
