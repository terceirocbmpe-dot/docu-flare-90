import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft, Boxes, ExternalLink, FolderOpen, GraduationCap,
  BarChart3, Shield, Siren, Truck, Users, Wrench,
} from "lucide-react";
import brasao from "@/assets/sobre/brasao-3gb.png.asset.json";

/*
 * Seções do 3º GB.
 * Para adicionar um assunto, inclua um item em `assuntos` da seção:
 *   { titulo: "Nome do assunto", descricao: "opcional", url: "https://..." }
 * Links internos do site usam `interno: true` (ex.: url: "/portal").
 */

type Assunto = { titulo: string; descricao?: string; url: string; interno?: boolean };
type Secao = {
  sigla: string;
  nome: string;
  Icone: typeof Shield;
  assuntos: Assunto[];
};

const SECOES: Secao[] = [
  {
    sigla: "DOP",
    nome: "Divisão de Operações",
    Icone: Siren,
    assuntos: [
      { titulo: "Escalas com Visual Moderno — 3º GB", descricao: "Escalas organizadas por ano e mês", url: "/portal", interno: true },
      { titulo: "Escalas no Google Drive", descricao: "Pasta original das escalas publicadas", url: "https://drive.google.com/drive/folders/1mQ2ex8bXG6lt-E2sE2_mmzSJ9QkhSiYk" },
      { titulo: "DInter/2 — Operações", url: "https://linktr.ee/dinter2cbmpe" },
      { titulo: "Cronograma de Prevenções e Palestras", url: "https://docs.google.com/spreadsheets/d/1gL_DSqWklsvbKXaWGhoyn4TW5i5pcsHSLBNpqU21mOc/edit?usp=sharing" },
    ],
  },
  {
    sigla: "SAlmox",
    nome: "Seção de Almoxarifado",
    Icone: Boxes,
    assuntos: [
      { titulo: "Controle de Almoxarifado", url: "https://script.google.com/macros/s/AKfycbxJkkUO1re3sFWYBAqfvtCi_9-M81pHfa4dl9dK9C5RNsaoF_kwvS-_agLxpezfOxiKBw/exec" },
    ],
  },
  {
    sigla: "SEO",
    nome: "Seção de Estatística Operacional",
    Icone: BarChart3,
    assuntos: [
      { titulo: "ROE — Relatório Operacional Eletrônico", descricao: "Sistema oficial de registro de ocorrências", url: "https://roe.bombeiros.pe.gov.br" },
    ],
  },
  {
    sigla: "SICT",
    nome: "Seção de Instrução e Coordenação Técnica",
    Icone: GraduationCap,
    assuntos: [
      { titulo: "Instruções Diárias", url: "https://drive.google.com/drive/folders/1hitRfibW8s3GSZAdkeJOWjbs3wHxfjs8?usp=sharing" },
    ],
  },
  {
    sigla: "SMO",
    nome: "Seção de Materiais Operacionais",
    Icone: Wrench,
    assuntos: [
      { titulo: "3º GB: Checklist de Material Operacional", descricao: "Conferência no primeiro dia de serviço de cada equipe", url: "https://docs.google.com/forms/d/e/1FAIpQLScI1wJE6jqlDPvIf6aPmb2Iw3ry2mXzaiWNjTPEiWapd-88NA/viewform?usp=sf_link" },
      { titulo: "DGO: Checklist de Material Operacional", descricao: "Senha divulgada internamente", url: "https://docs.google.com/forms/d/e/1FAIpQLSd-RAQ-gSiQhGSjEKkhKWz9J8Oq3YmjI6gO9tNfZUY9KKmh5Q/viewform" },
    ],
  },
  {
    sigla: "SP",
    nome: "Seção de Pessoal",
    Icone: Users,
    assuntos: [
      { titulo: "Controle de Férias 2026 e 2027", descricao: "Férias do efetivo por matrícula e mês", url: "https://leave-harmonize.lovable.app" },
    ],
  },
  {
    sigla: "STSGT",
    nome: "Seção de Transporte, Serviços Gerais e Telemática",
    Icone: Truck,
    assuntos: [
      { titulo: "Controle de Entrada e Saída de Viaturas", url: "https://docs.google.com/forms/d/e/1FAIpQLSdgAcvQJYWX7VTGGSP9LvUnSTCQfh5ebN2WUHTCliU1zdAfJQ/viewform?usp=sf_link" },
      { titulo: "Ficha de Inspeção de Viatura", url: "https://docs.google.com/forms/d/e/1FAIpQLSeEj3QbE7DYVo4RX-oL0SnVrrl9yRyeL-FNODuCNaRFsQwLvw/viewform?usp=sf_link" },
      { titulo: "Relatório: Controle de Viaturas — 3º GB", url: "https://docs.google.com/spreadsheets/d/1sKVIICYaPr41vtZ2VIOzJe14mWmsAfAEav1yhbDqG2Q/edit?usp=sharing" },
    ],
  },
];

export const Route = createFileRoute("/secoes")({
  head: () => ({
    meta: [
      { title: "Seções — 3º GB" },
      { name: "description", content: "Assuntos e sistemas de cada seção do 3º Grupamento de Bombeiros." },
      { property: "og:title", content: "Seções — 3º GB" },
      { property: "og:description", content: "Assuntos e sistemas de cada seção do 3º Grupamento de Bombeiros." },
    ],
  }),
  component: SecoesPage,
});

function SecoesPage() {
  return (
    <div className="min-h-screen">
      <header className="hero-fire relative overflow-hidden">
        <div className="fire-embers pointer-events-none" aria-hidden="true">
          <span /><span /><span /><span /><span /><span />
        </div>
        <div className="relative z-10 mx-auto max-w-5xl px-4 py-8 text-center md:py-12">
          <img src={brasao.url} alt="Brasão 3º GB" className="float-3d brasao-fire mx-auto mb-4 h-16 w-16 object-contain md:h-20 md:w-20" />
          <div className="mt-2 inline-flex items-center gap-2 text-[11px] sm:text-xs font-bold text-white/90 uppercase tracking-[0.25em]">
            <Shield className="h-3.5 w-3.5" />
            CBMPE — 3º GB
          </div>
          <h1 className="title-fire text-2xl font-bold tracking-tight md:text-4xl">Seções</h1>
          <p className="mt-2 text-sm text-white/70 md:text-base">Assuntos e sistemas de cada seção</p>
        </div>
        <div className="fire-stripes relative z-10" aria-hidden="true" />
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 md:py-10">
        <nav aria-label="Atalhos das seções" className="mb-8 flex flex-wrap justify-center gap-2">
          {SECOES.map((s) => (
            <a
              key={s.sigla}
              href={`#${s.sigla.toLowerCase()}`}
              className="rounded-full border px-3 py-1 text-xs font-semibold tracking-wide text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
            >
              {s.sigla}
            </a>
          ))}
        </nav>

        <div className="space-y-6">
          {SECOES.map((secao) => (
            <section
              key={secao.sigla}
              id={secao.sigla.toLowerCase()}
              className="scroll-mt-6 rounded-2xl border bg-card/40 p-4 md:p-5"
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
                  <secao.Icone className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    CBMPE · 3º GB · {secao.sigla}
                  </p>
                  <h2 className="text-base font-semibold text-foreground md:text-lg">{secao.nome}</h2>
                </div>
              </div>

              {secao.assuntos.length === 0 ? (
                <p className="text-sm text-muted-foreground">Em breve.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {secao.assuntos.map((a) => {
                    const Icone = a.interno ? FolderOpen : ExternalLink;
                    const conteudo = (
                      <>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium leading-snug text-foreground">{a.titulo}</p>
                          {a.descricao && <p className="mt-0.5 text-xs text-muted-foreground">{a.descricao}</p>}
                        </div>
                        <Icone className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-accent-foreground" />
                      </>
                    );
                    const classes = "card-3d group relative flex items-center gap-3 overflow-hidden rounded-2xl border px-4 py-3.5";
                    return a.interno ? (
                      <Link key={a.titulo} to={a.url as any} className={classes}>{conteudo}</Link>
                    ) : (
                      <a key={a.titulo} href={a.url} target="_blank" rel="noopener noreferrer" className={classes}>{conteudo}</a>
                    );
                  })}
                </div>
              )}
            </section>
          ))}
        </div>

        <footer className="mt-12 border-t border-border pt-6 text-center">
          <Link to="/" className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-primary">
            <ArrowLeft className="h-3 w-3" />
            Portal Operacional
          </Link>
        </footer>
      </main>
    </div>
  );
}
