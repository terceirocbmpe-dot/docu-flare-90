import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import brasao from "@/assets/sobre/brasao-3gb.png.asset.json";
import {
  Search,
  FileText,
  FileSpreadsheet,
  FileType,
  File as FileIcon,
  Calendar,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  SlidersHorizontal,
  Loader2,
  X,
  Folder,
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
  pasta?: string;
};

const API_URL =
  "https://script.google.com/macros/s/AKfycbxilpKR7XgWYf-QSTZ01MQ_b0R6e4riPGpanY4EWPjCc0vbCQ1PAv_PLyhaOd9JfkI/exec";

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

// --- Cache local persistente (leitura instantânea) -----------------------
// Guarda a última lista no navegador: nas próximas visitas a página abre na
// hora com os dados salvos e atualiza em segundo plano.
const LOCAL_CACHE_KEY = "docs-cache-v1";

function readLocalCache(): Doc[] | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.localStorage.getItem(LOCAL_CACHE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed?.docs) ? (parsed.docs as Doc[]) : undefined;
  } catch {
    return undefined;
  }
}

function writeLocalCache(docs: Doc[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify({ docs, at: Date.now() }));
  } catch {
    // armazenamento indisponível — segue sem cache
  }
}

async function fetchDocs(): Promise<Doc[]> {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Falha ao carregar documentos");
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

// --- Cache tiering -------------------------------------------------------

const MONTH_NAMES_PT = [
  "janeiro", "fevereiro", "março", "marco", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

/** Try to detect {year, month} (1-12) from a folder path or doc fields. */
function detectYearMonth(path: string): { year?: number; month?: number } {
  if (!path) return {};
  const lower = path.toLowerCase();
  const yearMatch = lower.match(/(20\d{2})/);
  const year = yearMatch ? Number(yearMatch[1]) : undefined;

  // numeric month: 2025/06, 2025-06, 06/2025
  const mm = lower.match(/(?:^|[^\d])(0?[1-9]|1[0-2])(?:[^\d]|$)/);
  let month: number | undefined;
  for (let i = 0; i < MONTH_NAMES_PT.length; i++) {
    if (lower.includes(MONTH_NAMES_PT[i])) {
      const norm = [1,2,3,3,4,5,6,7,8,9,10,11,12][i];
      month = norm;
      break;
    }
  }
  if (!month && mm) month = Number(mm[1]);
  return { year, month };
}

/**
 * Resolve cache policy for a selected folder path:
 *  - current month: refetch every 1min
 *  - earlier months of current year: refetch every 60min
 *  - previous years: 24h, no auto refetch
 *  - unknown / "Todos": default 60s (keeps prior behavior)
 */
function cachePolicyFor(path: string): {
  staleTime: number;
  refetchInterval: number | false;
  tier: "current-month" | "current-year" | "old-year" | "default";
} {
  const now = new Date();
  const curYear = now.getFullYear();
  const curMonth = now.getMonth() + 1;
  const { year, month } = detectYearMonth(path);

  if (year && year < curYear) {
    return { staleTime: 24 * 60 * 60_000, refetchInterval: false, tier: "old-year" };
  }
  if (year === curYear && month && month !== curMonth) {
    return { staleTime: 60 * 60_000, refetchInterval: 60 * 60_000, tier: "current-year" };
  }
  if (year === curYear && month === curMonth) {
    return { staleTime: 60_000, refetchInterval: 60_000, tier: "current-month" };
  }
  return { staleTime: 60_000, refetchInterval: 60_000, tier: "default" };
}

/** Convert any Google Drive view url to an embeddable preview url. */
function toPdfEmbedUrl(url: string) {
  const m = url.match(/\/d\/([^/]+)/);
  if (m) return `https://drive.google.com/file/d/${m[1]}/preview`;
  return url.replace(/\/view.*$/, "/preview");
}

function getNodeDepth(path: string) {
  return path === "" ? 0 : path.split("/").length;
}

function getNodeParent(path: string) {
  if (path === "") return "";
  const idx = path.lastIndexOf("/");
  return idx === -1 ? "" : path.slice(0, idx);
}


// --- Folder tree ---------------------------------------------------------

type FolderNode = {
  name: string;
  path: string; // full path joined by "/"
  count: number; // direct files
  total: number; // files including descendants
  children: Map<string, FolderNode>;
};

function buildFolderTree(docs: Doc[]): FolderNode {
  const root: FolderNode = {
    name: "Todos",
    path: "",
    count: 0,
    total: docs.length,
    children: new Map(),
  };
  for (const d of docs) {
    const segs = (d.pasta ?? "").split("/").map((s) => s.trim()).filter(Boolean);
    let node = root;
    let acc = "";
    for (const seg of segs) {
      acc = acc ? `${acc}/${seg}` : seg;
      let child = node.children.get(seg);
      if (!child) {
        child = { name: seg, path: acc, count: 0, total: 0, children: new Map() };
        node.children.set(seg, child);
      }
      child.total++;
      node = child;
    }
    node.count++;
  }
  return root;
}

function FolderTree({
  node,
  depth,
  active,
  expanded,
  onToggle,
  onSelect,
}: {
  node: FolderNode;
  depth: number;
  active: string;
  expanded: Set<string>;
  onToggle: (path: string) => void;
  onSelect: (path: string) => void;
}) {
  const children = Array.from(node.children.values()).sort((a, b) =>
    a.name.localeCompare(b.name, "pt-BR"),
  );
  return (
    <>
      {children.map((child) => {
        const hasKids = child.children.size > 0;
        const isOpen = expanded.has(child.path);
        const isActive = active === child.path;
        return (
          <div key={child.path}>
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={isActive}
                tooltip={child.name}
                onClick={() => onSelect(child.path)}
                className="pr-1"
                style={{ paddingLeft: `${0.5 + depth * 0.75}rem` }}
              >
                {hasKids ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggle(child.path);
                    }}
                    className="-ml-1 flex h-4 w-4 items-center justify-center rounded hover:bg-sidebar-accent"
                    aria-label={isOpen ? "Recolher" : "Expandir"}
                  >
                    <ChevronRight
                      className={cn("h-3.5 w-3.5 transition-transform", isOpen && "rotate-90")}
                    />
                  </button>
                ) : (
                  <span className="-ml-1 h-4 w-4" />
                )}
                {isOpen && hasKids ? (
                  <FolderOpen className="h-4 w-4" />
                ) : (
                  <Folder className="h-4 w-4" />
                )}
                <span className="truncate">{child.name}</span>
                <Badge
                  variant="secondary"
                  className={cn(
                    "ml-auto h-5 min-w-[1.5rem] justify-center px-1.5 text-[10px] font-medium tabular-nums group-data-[collapsible=icon]:hidden",
                    isActive && "bg-primary text-primary-foreground",
                  )}
                >
                  {child.total}
                </Badge>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {hasKids && isOpen && (
              <FolderTree
                node={child}
                depth={depth + 1}
                active={active}
                expanded={expanded}
                onToggle={onToggle}
                onSelect={onSelect}
              />
            )}
          </div>
        );
      })}
    </>
  );
}

export function DocumentsCenter() {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sort, setSort] = useState<"desc" | "asc">("desc");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [pdfDoc, setPdfDoc] = useState<Doc | null>(null);
  const [folderPath, setFolderPath] = useState<string>(""); // "" = todos
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());
  // Pastas expandidas na ÁREA PRINCIPAL (chave = caminho completo da pasta).
  const [openNodes, setOpenNodes] = useState<Set<string>>(new Set());
  const [loadedNodes, setLoadedNodes] = useState<Set<string>>(new Set());

  // Cache policy depends on which folder the user is viewing.
  // - current month: 60s revalidation
  // - earlier months of current year: 60min
  // - previous years: 24h, no auto refetch
  const policy = useMemo(() => cachePolicyFor(folderPath), [folderPath]);

  const { data, isLoading, isError, refetch, isFetching, dataUpdatedAt } = useQuery({
    queryKey: ["documents"],
    queryFn: fetchDocs,
    staleTime: policy.staleTime,
    refetchInterval: policy.refetchInterval,
    refetchIntervalInBackground: true,
    placeholderData: () => readLocalCache(),
  });

  const docs = data ?? [];

  // Persiste a lista mais recente para abrir instantâneo na próxima visita.
  useEffect(() => {
    if (data && data.length) writeLocalCache(data);
  }, [data]);

  const types = useMemo(() => {
    const set = new Set<string>();
    docs.forEach((d) => set.add(normalizeType(d.tipo)));
    return Array.from(set);
  }, [docs]);

  const tree = useMemo(() => buildFolderTree(docs), [docs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return docs
      .filter((d) => {
        if (folderPath) {
          const p = d.pasta ?? "";
          if (p !== folderPath && !p.startsWith(folderPath + "/")) return false;
        }
        if (typeFilter !== "all" && normalizeType(d.tipo) !== typeFilter) return false;
        if (!q) return true;
        return (
          d.nome?.toLowerCase().includes(q) ||
          d.tipo?.toLowerCase().includes(q) ||
          (d.pasta ?? "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const da = new Date(a.atualizado).getTime() || 0;
        const db = new Date(b.atualizado).getTime() || 0;
        return sort === "desc" ? db - da : da - db;
      });
  }, [docs, query, typeFilter, sort, folderPath]);

  const openDoc = useCallback((doc: Doc) => {
    const k = normalizeType(doc.tipo);
    if (k === "pdf") {
      setPdfDoc(doc);
    } else {
      window.open(doc.url, "_blank", "noopener,noreferrer");
    }
  }, []);

  const toggleFolder = useCallback((path: string) => {
    setOpenFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        // Fechar o próprio nó e todos os seus descendentes
        next.delete(path);
        for (const p of Array.from(next)) {
          if (p.startsWith(path + "/")) next.delete(p);
        }
      } else {
        // Acordeão: fechar irmãos no mesmo nível antes de abrir
        const targetDepth = getNodeDepth(path);
        const targetParent = getNodeParent(path);
        for (const p of Array.from(next)) {
          if (getNodeDepth(p) === targetDepth && getNodeParent(p) === targetParent) {
            next.delete(p);
          }
        }
        next.add(path);
      }
      return next;
    });
  }, []);

  const handleSelectFolder = useCallback((path: string) => {
    setFolderPath(path);
  }, []);

  const handleToggleExpand = useCallback((id: string) => {
    setExpanded((prev) => (prev === id ? null : id));
  }, []);

  const toggleNode = useCallback((path: string) => {
    setOpenNodes((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        // Fechar o próprio nó e todos os seus descendentes
        next.delete(path);
        for (const p of Array.from(next)) {
          if (p.startsWith(path + "/")) next.delete(p);
        }
      } else {
        // Acordeão: manter apenas uma pasta aberta por nível
        const targetDepth = getNodeDepth(path);
        const targetParent = getNodeParent(path);
        for (const p of Array.from(next)) {
          if (getNodeDepth(p) === targetDepth && getNodeParent(p) === targetParent) {
            next.delete(p);
          }
        }
        next.add(path);
      }
      return next;
    });
  }, []);

  // Lazy "loading" state for newly opened folders — exibe skeleton breve
  // antes de montar os cards. Arquivos só são renderizados quando a
  // pasta é explicitamente aberta.
  useEffect(() => {
    const pending = Array.from(openNodes).filter((k) => !loadedNodes.has(k));
    if (pending.length === 0) return;
    const t = setTimeout(() => {
      setLoadedNodes((prev) => {
        const next = new Set(prev);
        pending.forEach((k) => next.add(k));
        return next;
      });
    }, 250);
    return () => clearTimeout(t);
  }, [openNodes, loadedNodes]);

  const activeLabel = folderPath
    ? folderPath.split("/").pop() ?? "Todos"
    : "Todos os documentos";

  // Mapa de arquivos por pasta (apenas arquivos diretos, não descendentes)
  // — espelha a hierarquia da barra lateral na área principal.
  const docsByFolder = useMemo(() => {
    const map = new Map<string, Doc[]>();
    for (const d of filtered) {
      const p = d.pasta ?? "";
      const arr = map.get(p) ?? [];
      arr.push(d);
      map.set(p, arr);
    }
    return map;
  }, [filtered]);

  // Subárvore de pastas a renderizar na área principal: raiz, ou nó
  // correspondente à pasta selecionada na barra lateral.
  const rootNode = useMemo(() => {
    if (!folderPath) return tree;
    const segs = folderPath.split("/").filter(Boolean);
    let n: FolderNode | undefined = tree;
    for (const s of segs) {
      n = n?.children.get(s);
      if (!n) break;
    }
    return n ?? tree;
  }, [tree, folderPath]);

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader className="border-b border-sidebar-border">
          <div className="flex items-center gap-2 px-2 py-1.5">
            <img
              src={brasao.url}
              alt="3º GB"
              className="h-9 w-9 shrink-0 object-contain"
            />
            <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
              <span className="text-sm font-semibold">3º GB</span>
              <span className="text-xs text-muted-foreground">Central de Documentos</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Pastas</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={folderPath === ""}
                    onClick={() => setFolderPath("")}
                    tooltip="Todos"
                  >
                    <Files className="h-4 w-4" />
                    <span>Todos</span>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "ml-auto h-5 min-w-[1.5rem] justify-center px-1.5 text-[10px] font-medium tabular-nums group-data-[collapsible=icon]:hidden",
                        folderPath === "" && "bg-primary text-primary-foreground",
                      )}
                    >
                      {tree.total}
                    </Badge>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <FolderTree
                  node={tree}
                  depth={0}
                  active={folderPath}
                  expanded={openFolders}
                  onToggle={toggleFolder}
                  onSelect={handleSelectFolder}
                />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <SidebarInset className="bg-background">
        <header className="header-3d border-b border-border bg-gradient-to-b from-primary/5 to-transparent">
          <div className="px-4 py-5 md:px-8 md:py-6">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="-ml-1" />
              <img
                src={brasao.url}
                alt="Brasão 3º GB"
                className="float-3d h-11 w-11 shrink-0 object-contain"
              />
              <div className="min-w-0">
                <h1 className="truncate text-lg font-semibold tracking-tight md:text-2xl">
                  {activeLabel}
                </h1>
                {folderPath && (
                  <p className="truncate text-xs text-muted-foreground">{folderPath}</p>
                )}
              </div>
            </div>

            {/* Toolbar */}
            <div className="mt-6 flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Pesquisar por nome, tipo ou pasta..."
                  className="h-11 bg-card pl-9 pr-9"
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
                  <SelectTrigger className="h-11 flex-1 bg-card md:w-[150px] md:flex-none">
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
                  <SelectTrigger className="h-11 flex-1 bg-card md:w-[170px] md:flex-none">
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
        <main className="px-4 py-6 md:px-8 md:py-8">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex flex-col">
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                {isLoading
                  ? "Carregando..."
                  : `${filtered.length} ${filtered.length === 1 ? "documento" : "documentos"}`}
                {!isLoading && isFetching && policy.tier === "current-month" && (
                  <span
                    className="inline-flex items-center gap-1 text-[11px] text-primary/80"
                    title="Atualizando em segundo plano"
                  >
                    <Loader2 className="h-3 w-3 animate-spin" />
                    atualizando
                  </span>
                )}
              </p>
              {dataUpdatedAt > 0 && (
                <p className="text-[11px] text-muted-foreground/70">
                  {policy.tier === "current-month"
                    ? "Atualiza a cada 1 min"
                    : policy.tier === "current-year"
                      ? "Atualiza a cada 60 min"
                      : policy.tier === "old-year"
                        ? "Cache de 24 h"
                        : "Atualiza a cada 1 min"}
                  {" · última "}
                  {new Date(dataUpdatedAt).toLocaleTimeString("pt-BR")}
                </p>
              )}
            </div>
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
            <div className="space-y-3">
              <FolderBranchList
                node={rootNode}
                depth={0}
                openNodes={openNodes}
                loadedNodes={loadedNodes}
                onToggle={toggleNode}
                docsByFolder={docsByFolder}
                expanded={expanded}
                onOpen={openDoc}
                onToggleExpand={handleToggleExpand}
              />
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
                  src={toPdfEmbedUrl(pdfDoc.url)}
                  className="h-full w-full"
                  title={pdfDoc.nome}
                  allow="autoplay"
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
      </SidebarInset>
    </SidebarProvider>
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

function MonthSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-[120px] animate-pulse rounded-xl border border-border bg-muted/40"
        />
      ))}
    </div>
  );
}

const MONTH_LABELS_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
function monthLabel(mm: string) {
  const n = Number(mm);
  if (!n || n < 1 || n > 12) return mm;
  return MONTH_LABELS_PT[n - 1];
}

function FolderBranchList({
  node,
  depth,
  openNodes,
  loadedNodes,
  onToggle,
  docsByFolder,
  expanded,
  onOpen,
  onToggleExpand,
}: {
  node: FolderNode;
  depth: number;
  openNodes: Set<string>;
  loadedNodes: Set<string>;
  onToggle: (path: string) => void;
  docsByFolder: Map<string, Doc[]>;
  expanded: string | null;
  onOpen: (doc: Doc) => void;
  onToggleExpand: (id: string) => void;
}) {
  const children = Array.from(node.children.values()).sort((a, b) =>
    a.name.localeCompare(b.name, "pt-BR"),
  );
  if (children.length === 0) {
    // Pasta-folha selecionada na sidebar: lista direta dos arquivos.
    const files = docsByFolder.get(node.path) ?? [];
    if (files.length === 0) return null;
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {files.map((doc, i) => {
          const id = `${node.path}::${doc.nome}::${i}`;
          return (
            <DocCard
              key={id}
              id={id}
              doc={doc}
              isOpen={expanded === id}
              onOpen={onOpen}
              onToggleExpand={onToggleExpand}
            />
          );
        })}
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {children.map((child) => (
        <FolderBranch
          key={child.path}
          node={child}
          depth={depth}
          openNodes={openNodes}
          loadedNodes={loadedNodes}
          onToggle={onToggle}
          docsByFolder={docsByFolder}
          expanded={expanded}
          onOpen={onOpen}
          onToggleExpand={onToggleExpand}
        />
      ))}
    </div>
  );
}

const FolderBranch = memo(function FolderBranch({
  node,
  depth,
  openNodes,
  loadedNodes,
  onToggle,
  docsByFolder,
  expanded,
  onOpen,
  onToggleExpand,
}: {
  node: FolderNode;
  depth: number;
  openNodes: Set<string>;
  loadedNodes: Set<string>;
  onToggle: (path: string) => void;
  docsByFolder: Map<string, Doc[]>;
  expanded: string | null;
  onOpen: (doc: Doc) => void;
  onToggleExpand: (id: string) => void;
}) {
  const isOpen = openNodes.has(node.path);
  const isLoaded = loadedNodes.has(node.path);
  const childFolders = Array.from(node.children.values()).sort((a, b) =>
    a.name.localeCompare(b.name, "pt-BR"),
  );
  const directFiles = docsByFolder.get(node.path) ?? [];
  const hasChildren = childFolders.length > 0;

  // Sequence id changes each time the node opens, retriggering the
  // energy pulse animation along its connection rail.
  const [pulseKey, setPulseKey] = useState(0);
  const prevOpen = useRef(false);
  useEffect(() => {
    if (isOpen && !prevOpen.current) setPulseKey((k) => k + 1);
    prevOpen.current = isOpen;
  }, [isOpen]);

  const isTop = depth === 0;

  return (
    <div className="relative">
      {/* Folder node card */}
      <button
        type="button"
        onClick={() => onToggle(node.path)}
        aria-expanded={isOpen}
        className={cn(
          "group/node relative flex w-full items-center gap-3 overflow-hidden rounded-xl border bg-card text-left transition-all",
          "hover:-translate-y-px hover:border-primary/40 hover:shadow-[0_0_0_1px_oklch(0.42_0.18_25/0.15),0_8px_24px_-12px_oklch(0.42_0.18_25/0.35)]",
          isOpen
            ? "border-primary/50 shadow-[0_0_0_1px_oklch(0.42_0.18_25/0.25),0_10px_30px_-14px_oklch(0.42_0.18_25/0.55)]"
            : "border-border",
          isTop ? "px-4 py-3.5" : "px-4 py-2.5",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition-colors",
            isOpen
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-border bg-muted/40 text-muted-foreground group-hover/node:text-primary",
          )}
        >
          {isOpen ? <FolderOpen className="h-3.5 w-3.5" /> : <Folder className="h-3.5 w-3.5" />}
        </span>
        <span
          className={cn(
            "truncate",
            isTop ? "text-sm font-semibold tracking-tight" : "text-sm font-medium",
          )}
        >
          {node.name}
        </span>
        <Badge
          variant="outline"
          className={cn(
            "ml-auto h-5 min-w-[1.75rem] justify-center px-1.5 text-[10px] font-medium tabular-nums",
            isOpen && "border-primary/30 bg-primary/10 text-primary",
          )}
        >
          {node.total}
        </Badge>
        <ChevronRight
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300",
            isOpen && "rotate-90 text-primary",
          )}
        />
      </button>

      {/* Branch with red glowing connection rail */}
      {isOpen && (
        <div className="relative ml-4 mt-2 pl-6">
          {/* Vertical rail */}
          <span
            aria-hidden
            className="pointer-events-none absolute left-0 top-0 bottom-2 w-px bg-gradient-to-b from-primary/70 via-primary/40 to-transparent shadow-[0_0_6px_oklch(0.42_0.18_25/0.45)]"
          />
          {/* Energy pulse */}
          <span
            key={pulseKey}
            aria-hidden
            className="animate-energy-flow pointer-events-none absolute left-0 top-0 h-10 w-px -translate-x-px bg-gradient-to-b from-transparent via-primary to-transparent shadow-[0_0_10px_2px_oklch(0.42_0.18_25/0.7)]"
          />

          {!isLoaded ? (
            <div className="py-1">
              <MonthSkeleton />
            </div>
          ) : (
            <div className="space-y-3">
              {hasChildren &&
                childFolders.map((child) => (
                  <div key={child.path} className="relative">
                    {/* Horizontal connector to child */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute -left-6 top-5 h-px w-6 bg-gradient-to-r from-primary/60 to-primary/10"
                    />
                    <FolderBranch
                      node={child}
                      depth={depth + 1}
                      openNodes={openNodes}
                      loadedNodes={loadedNodes}
                      onToggle={onToggle}
                      docsByFolder={docsByFolder}
                      expanded={expanded}
                      onOpen={onOpen}
                      onToggleExpand={onToggleExpand}
                    />
                  </div>
                ))}
              {directFiles.length > 0 && (
                <div className="relative">
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -left-6 top-8 h-px w-6 bg-gradient-to-r from-primary/60 to-primary/10"
                  />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {directFiles.map((doc, i) => {
                      const id = `${node.path}::${doc.nome}::${i}`;
                      return (
                        <DocCard
                          key={id}
                          id={id}
                          doc={doc}
                          isOpen={expanded === id}
                          onOpen={onOpen}
                          onToggleExpand={onToggleExpand}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
              {!hasChildren && directFiles.length === 0 && (
                <p className="px-1 py-2 text-xs text-muted-foreground">Pasta vazia</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

const DocCard = memo(function DocCard({
  id,
  doc,
  isOpen,
  onOpen,
  onToggleExpand,
}: {
  id: string;
  doc: Doc;
  isOpen: boolean;
  onOpen: (doc: Doc) => void;
  onToggleExpand: (id: string) => void;
}) {
  const meta = typeMeta(doc.tipo);
  const Icon = meta.Icon;
  return (
    <article
      className={cn(
        "card-3d group relative overflow-hidden rounded-2xl border border-border bg-card",
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
              <Row label="Pasta" value={doc.pasta ?? "—"} />
              <Row label="Atualizado" value={formatDate(doc.atualizado)} />
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Button size="sm" onClick={() => onOpen(doc)} className="flex-1">
            <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
            Abrir
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onToggleExpand(id)}
            aria-label="Expandir"
          >
            <ChevronDown
              className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")}
            />
          </Button>
        </div>
      </div>
    </article>
  );
});
