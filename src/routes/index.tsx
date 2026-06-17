import { createFileRoute } from "@tanstack/react-router";
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
  component: DocumentsCenter,
});
