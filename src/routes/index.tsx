import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { DocumentsCenter } from "@/components/documents-center";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Central de Documentos" },
      { name: "description", content: "Acesse, pesquise e organize todos os seus documentos em um só lugar." },
      { property: "og:title", content: "Central de Documentos" },
      { property: "og:description", content: "Acesse, pesquise e organize todos os seus documentos em um só lugar." },
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
          to="/portal"
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
