import { createFileRoute, Link } from "@tanstack/react-router";
import { DocumentsCenter } from "@/components/documents-center";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/portal")({
  head: () => ({
    meta: [
      { title: "Escalas de Serviço 2026 — 3º GB" },
      { name: "description", content: "Escalas e documentos do serviço operacional do 3º Grupamento de Bombeiros." },
      { property: "og:title", content: "Escalas de Serviço 2026 — 3º GB" },
    ],
  }),
  component: EscalasPage,
});

function EscalasPage() {
  return (
    <>
      <DocumentsCenter />
      <div className="fixed bottom-3 right-4 z-40 flex items-center gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground/70 hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
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
