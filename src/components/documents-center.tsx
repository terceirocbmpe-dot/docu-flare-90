import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  FileText,
  FileSpreadsheet,
  FileType,
  File as FileIcon,
  Calendar,
  ExternalLink,
  ChevronDown,
  SlidersHorizontal,
  Loader2,
  X,
  CalendarDays,
  Plane,
  Newspaper,
  BarChart3,
  FolderOpen,
  Files,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

type Doc = {
  nome: string;
  tipo: string;
  url: string;
  atualizado: string;
};

const API_URL =
  "https://script.google.com/macros/s/AKfycbySDEekll4OVo2iRmFmUuIo-OHNorouOegyQRo5vt2ktXjyCmGY0fPTvXN1stgP2JJeSw/exec";

function normalizeType(t: string): "pdf" | "excel" | "word" | "outro" {
  const v = (t || "").toLowerCase();
  if (v.includes("pdf")) return "pdf";
  if (v.includes("xls") || v.includes("sheet") || v.includes("excel") || v.includes("planilha"))
    return "excel";
  if (v.includes("doc") || v.includes("word")) return "word";
  return "outro";
}

function typeMeta(t: string) {
  const k = normalizeType(t);
  switch (k) {
    case "pdf":
      return { label: "PDF", Icon: FileType, color: "bg-primary/10 text-primary border-primary/20" };
    case "excel":
      return {
        label: "Excel",
        Icon: FileSpreadsheet,
        color: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
      };
    case "word":
      return {
        label: "Word",
        Icon: FileText,
        color: "bg-blue-500/10 text-blue-700 border-blue-500/20",
      };
    default:
      return { label: t || "Arquivo", Icon: FileIcon, color: "bg-muted text-muted-foreground border-border" };
  }
}

function formatDate(d: string) {
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return d;
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

async function fetchDocs(): Promise<Doc[]> {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Falha ao carregar documentos");
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

type CategoryKey = "all" | "escalas" | "ferias" | "boletins" | "relatorios" | "diversos";

const CATEGORIES: { key: CategoryKey; label: string; Icon: typeof Files; keywords: string[] }[] = [
  { key: "all", label: "Todos", Icon: Files, keywords: [] },
  { key: "escalas", label: "Escalas", Icon: CalendarDays, keywords: ["escala"] },
  { key: "ferias", label: "Férias", Icon: Plane, keywords: ["feria", "férias", "ferias"] },
  { key: "boletins", label: "Boletins", Icon: Newspaper, keywords: ["boletim", "boletins"] },
  { key: "relatorios", label: "Relatórios", Icon: BarChart3, keywords: ["relatorio", "relatório"] },
  { key: "diversos", label: "Diversos", Icon: FolderOpen, keywords: [] },
];

function categorize(doc: Doc): CategoryKey {
  const haystack = `${doc.nome ?? ""} ${doc.tipo ?? ""}`.toLowerCase();
  for (const cat of CATEGORIES) {
    if (cat.key === "all" || cat.key === "diversos") continue;
    if (cat.keywords.some((k) => haystack.includes(k))) return cat.key;
  }
  return "diversos";
}

export function DocumentsCenter() {
  const { data, isLoading, isError, refetch, isFetching, dataUpdatedAt } = useQuery({
    queryKey: ["documents"],
    queryFn: fetchDocs,
    refetchInterval: 60_000,
    refetchIntervalInBackground: true,
  });

  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sort, setSort] = useState<"desc" | "asc">("desc");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [pdfDoc, setPdfDoc] = useState<Doc | null>(null);
  const [category, setCategory] = useState<CategoryKey>("all");

  const docs = data ?? [];

  const types = useMemo(() => {
    const set = new Set<string>();
    docs.forEach((d) => set.add(normalizeType(d.tipo)));
    return Array.from(set);
  }, [docs]);

  const countsByCategory = useMemo(() => {
    const counts: Record<CategoryKey, number> = {
      all: docs.length,
      escalas: 0,
      ferias: 0,
      boletins: 0,
      relatorios: 0,
      diversos: 0,
    };
    docs.forEach((d) => {
      counts[categorize(d)]++;
    });
    return counts;
  }, [docs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return docs
      .filter((d) => {
        if (category !== "all" && categorize(d) !== category) return false;
        if (typeFilter !== "all" && normalizeType(d.tipo) !== typeFilter) return false;
        if (!q) return true;
        return (
          d.nome?.toLowerCase().includes(q) ||
          d.tipo?.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const da = new Date(a.atualizado).getTime() || 0;
        const db = new Date(b.atualizado).getTime() || 0;
        return sort === "desc" ? db - da : da - db;
      });
  }, [docs, query, typeFilter, sort, category]);

  function openDoc(doc: Doc) {
    const k = normalizeType(doc.tipo);
    if (k === "pdf") {
      setPdfDoc(doc);
    } else {
      window.open(doc.url, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-gradient-to-b from-primary/5 to-transparent">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Central de Documentos</h1>
              <p className="text-sm text-muted-foreground">
                Pesquise, filtre e acesse seus arquivos rapidamente.
              </p>
            </div>
          </div>

          {/* Toolbar */}
          <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Pesquisar por nome ou tipo..."
                className="h-11 pl-9 pr-9 bg-card"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Limpar"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-11 w-[160px] bg-card">
                  <SlidersHorizontal className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  {types.map((t) => (
                    <SelectItem key={t} value={t}>
                      {typeMeta(t).label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sort} onValueChange={(v: "asc" | "desc") => setSort(v)}>
                <SelectTrigger className="h-11 w-[180px] bg-card">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Mais recentes</SelectItem>
                  <SelectItem value="asc">Mais antigos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {isLoading
              ? "Carregando..."
              : `${filtered.length} ${filtered.length === 1 ? "documento" : "documentos"}`}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-muted-foreground hover:text-foreground"
          >
            {isFetching && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
            Atualizar
          </Button>
        </div>

        {isLoading ? (
          <SkeletonGrid />
        ) : isError ? (
          <EmptyState
            title="Não foi possível carregar"
            description="Verifique sua conexão e tente novamente."
            action={<Button onClick={() => refetch()}>Tentar novamente</Button>}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="Nenhum documento encontrado"
            description={
              docs.length === 0
                ? "Ainda não há documentos disponíveis."
                : "Tente ajustar a busca ou o filtro."
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((doc, i) => {
              const id = `${doc.nome}-${i}`;
              const isOpen = expanded === id;
              const meta = typeMeta(doc.tipo);
              const Icon = meta.Icon;
              return (
                <article
                  key={id}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all",
                    "hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
                  )}
                >
                  <div className="p-5">
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border",
                          meta.color,
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
                          {doc.nome}
                        </h3>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className={cn("font-normal", meta.color)}>
                            {meta.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(doc.atualizado)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div
                      className={cn(
                        "grid transition-all duration-300 ease-out",
                        isOpen ? "mt-4 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                      )}
                    >
                      <div className="overflow-hidden">
                        <div className="space-y-2 rounded-lg border border-border bg-muted/40 p-3 text-xs">
                          <Row label="Nome" value={doc.nome} />
                          <Row label="Tipo" value={doc.tipo} />
                          <Row label="Atualizado" value={formatDate(doc.atualizado)} />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => openDoc(doc)}
                        className="flex-1"
                      >
                        <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                        Abrir
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setExpanded(isOpen ? null : id)}
                        aria-label="Expandir"
                      >
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform",
                            isOpen && "rotate-180",
                          )}
                        />
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* PDF Modal */}
      <Dialog open={!!pdfDoc} onOpenChange={(o) => !o && setPdfDoc(null)}>
        <DialogContent className="max-w-5xl p-0 sm:max-w-5xl">
          <DialogHeader className="border-b border-border px-5 py-3">
            <DialogTitle className="flex items-center gap-2 text-base">
              <FileType className="h-4 w-4 text-primary" />
              <span className="truncate">{pdfDoc?.nome}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="h-[75vh] w-full bg-muted">
            {pdfDoc && (
              <iframe
                src={pdfDoc.url}
                className="h-full w-full"
                title={pdfDoc.nome}
              />
            )}
          </div>
          <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pdfDoc && window.open(pdfDoc.url, "_blank", "noopener,noreferrer")}
            >
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
              Abrir em nova aba
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}

function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 px-6 py-20 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <FileIcon className="h-5 w-5 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="h-[168px] animate-pulse rounded-2xl border border-border bg-card"
        />
      ))}
    </div>
  );
}