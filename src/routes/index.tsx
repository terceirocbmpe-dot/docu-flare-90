import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { DocumentsCenter } from "@/components/documents-center";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Escalas de Serviço 2026 — 3º GB" },
      { name: "description", content: "Escalas e documentos do serviço operacional do 3º Grupamento de Bombeiros." },
      { property: "og:title", content: "Escalas de Serviço 2026 — 3º GB" },
      { property: "og:description", content: "Escalas e documentos do serviço operacional do 3º Grupamento de Bombeiros." },
    ],
  }),
  component: IndexPage,
});

function IndexPage() {
  return (
    <>
      <DocumentsCenter />
      <div className="fixed bottom-3 right-4 z-40 flex items-center gap-4">
        <Link
          to="/"
          className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/70 hover:text-primary transition-colors"
        >
          Portal Operacional
        </Link>
        <Link
          to="/sobre"
          className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/70 hover:text-primary transition-colors"
        >
          Sobre o 3º GB
        </Link>
      </div>
    </>
  );
}
