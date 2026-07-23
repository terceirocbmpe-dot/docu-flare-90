import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarDays,
  Siren,
  Truck,
  Boxes,
  GraduationCap,
  Users,
  Flame,
  ExternalLink,
  FolderOpen,
  Instagram,
  ArrowLeft,
} from "lucide-react";
import brasao from "@/assets/sobre/brasao-3gb.png.asset.json";

// ================= LINKS DO PORTAL =================
// Para ativar o cartão do Voluntariado PE Seguro, troque o valor abaixo
// pelo endereço publicado do app (ex.: https://SEU-APP.lovable.app)
const URL_PE_SEGURO = "AJUSTAR";

type PortalLink = {
  titulo: string;
  descricao?: string;
  url: string;
  interno?: boolean;
};

type Secao = {
  titulo: string;
  Icone: typeof Flame;
  links: PortalLink[];
};

const SECOES: Secao[] = [
  {
    titulo: "Sistemas do 3º GB",
    Icone: Flame,
    links: [
      {
        titulo: "Escalas de Serviço 2026",
        descricao: "Escalas e documentos do serviço operacional",
        url: "/escalas",
        interno: true,
      },
      ...(URL_PE_SEGURO.startsWith("http")
        ? [
            {
              titulo: "Voluntariado PE Seguro",
              descricao: "Inscrição mensal de voluntários",
              url: URL_PE_SEGURO,
            },
          ]
        : []),
    ],
  },
  {
    titulo: "Escala Operacional",
    Icone: CalendarDays,
    links: [
      {
        titulo: "Escalas de Serviço 2026",
        descricao: "Escalas e documentos do serviço operacional",
        url: "/escalas",
        interno: true,
      },
      {
        titulo: "DInter/2 — Operações",
        url: "https://linktr.ee/dinter2cbmpe",
      },
      {
        titulo: "Cronograma de Prevenções e Palestras",
        url: "https://docs.google.com/spreadsheets/d/1gL_DSqWklsvbKXaWGhoyn4TW5i5pcsHSLBNpqU21mOc/edit?usp=sharing",
      },
    ],
  },
  {
    titulo: "Férias",
    Icone: CalendarDays,
    links: [
      {
        titulo: "Controle de Férias 2026 e 2027",
        descricao: "Férias do efetivo por matrícula e mês",
        url: "https://leave-harmonize.lovable.app",
      },
    ],
  },
  {
    titulo: "Lançamento de Ocorrências",
    Icone: Siren,
    links: [
      {
        titulo: "ROE — Relatório Operacional Eletrônico",
        descricao: "Sistema oficial de registro de ocorrências",
        url: "https://roe.bombeiros.pe.gov.br",
      },
    ],
  },
  {
    titulo: "Controle de Viaturas",
    Icone: Truck,
    links: [
      {
        titulo: "Controle de Entrada e Saída de Viaturas",
        url: "https://docs.google.com/forms/d/e/1FAIpQLSdgAcvQJYWX7VTGGSP9LvUnSTCQfh5ebN2WUHTCliU1zdAfJQ/viewform?usp=sf_link",
      },
      {
        titulo: "Ficha de Inspeção de Viatura",
        url: "https://docs.google.com/forms/d/e/1FAIpQLSeEj3QbE7DYVo4RX-oL0SnVrrl9yRyeL-FNODuCNaRFsQwLvw/viewform?usp=sf_link",
      },
      {
        titulo: "Relatório: Controle de Viaturas — 3º GB",
        url: "https://docs.google.com/spreadsheets/d/1sKVIICYaPr41vtZ2VIOzJe14mWmsAfAEav1yhbDqG2Q/edit?usp=sharing",
      },
    ],
  },
  {
    titulo: "Almoxarifado e Material Operacional",
    Icone: Boxes,
    links: [
      {
        titulo: "Controle de Almoxarifado",
        url: "https://script.google.com/macros/s/AKfycbxJkkUO1re3sFWYBAqfvtCi_9-M81pHfa4dl9dK9C5RNsaoF_kwvS-_agLxpezfOxiKBw/exec",
      },
      {
        titulo: "3º GB: Checklist de Material Operacional",
        descricao: "Conferência no primeiro dia de serviço de cada equipe",
        url: "https://docs.google.com/forms/d/e/1FAIpQLScI1wJE6jqlDPvIf6aPmb2Iw3ry2mXzaiWNjTPEiWapd-88NA/viewform?usp=sf_link",
      },
      {
        titulo: "DGO: Checklist de Material Operacional",
        descricao: "Senha divulgada internamente",
        url: "https://docs.google.com/forms/d/e/1FAIpQLSd-RAQ-gSiQhGSjEKkhKWz9J8Oq3YmjI6gO9tNfZUY9KKmh5Q/viewform",
      },
    ],
  },
  {
    titulo: "Instrução",
    Icone: GraduationCap,
    links: [
      {
        titulo: "Instruções Diárias",
        url: "https://drive.google.com/drive/folders/1hitRfibW8s3GSZAdkeJOWjbs3wHxfjs8?usp=sharing",
      },
    ],
  },
  {
    titulo: "Informações e Contatos",
    Icone: Users,
    links: [
      {
        titulo: "Pilotos de Drone",
        url: "https://docs.google.com/spreadsheets/d/1I1WELedaFKXuK9KxcOEab6uPl1idylVSJECAUXhGzio/edit?usp=sharing",
      },
      {
        titulo: "Contatos de Municípios — 3º GB",
        url: "https://docs.google.com/spreadsheets/d/1Qe5DQ14TpiXRZgzF-WQGsVClQGw4eNKpvFEId2kent4/edit?usp=sharing",
      },
      {
        titulo: "Instagram @3gbcbmpe",
        url: "https://www.instagram.com/3gbcbmpe",
      },
    ],
  },
];
// ====================================================

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Portal Operacional — 3º GB" },
      {
        name: "description",
        content:
          "Acesso rápido aos sistemas, escalas, formulários e contatos do serviço operacional do 3º Grupamento de Bombeiros.",
      },
      { property: "og:title", content: "Portal Operacional — 3º GB" },
      {
        property: "og:description",
        content: "Sistemas e documentos do serviço operacional do 3º GB em um só lugar.",
      },
    ],
  }),
  component: PortalPage,
});

function LinkIconFor(link: PortalLink) {
  if (link.url.includes("instagram")) return Instagram;
  if (link.interno) return FolderOpen;
  return ExternalLink;
}

function PortalPage() {
  return (
    <div className="min-h-screen">
      {/* Cabeçalho em brasa */}
      <header className="hero-fire relative overflow-hidden">
        <div className="fire-embers pointer-events-none" aria-hidden="true">
          <span /><span /><span /><span /><span /><span />
        </div>
        <div className="relative z-10 mx-auto max-w-5xl px-4 py-8 text-center md:py-12">
          <img
            src={brasao.url}
            alt="Brasão 3º GB"
            className="float-3d brasao-fire mx-auto mb-4 h-20 w-20 object-contain md:h-24 md:w-24"
          />
          <h1 className="title-fire text-2xl font-bold tracking-tight md:text-4xl">
            Portal Operacional
          </h1>
          <p className="mt-2 text-sm text-white/70 md:text-base">
            3º Grupamento de Bombeiros — CBMPE
          </p>
        </div>
        <div className="fire-stripes relative z-10" aria-hidden="true" />
      </header>

      {/* Seções de links */}
      <main className="mx-auto max-w-5xl px-4 py-8 md:py-10">
        <div className="space-y-8">
          {SECOES.filter((s) => s.links.length > 0).map((secao) => (
            <section key={secao.titulo}>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-white/60">
                <secao.Icone className="h-4 w-4 text-primary" />
                {secao.titulo}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {secao.links.map((link) => {
                  const Icone = LinkIconFor(link);
                  const conteudo = (
                    <>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-foreground">
                          {link.titulo}
                        </p>
                        {link.descricao && (
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {link.descricao}
                          </p>
                        )}
                      </div>
                      <Icone className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-accent-foreground" />
                    </>
                  );
                  const classes =
                    "card-3d group relative flex items-center gap-3 overflow-hidden rounded-2xl border px-4 py-3.5";
                  return link.interno ? (
                    <Link key={link.titulo} to={link.url} className={classes}>
                      {conteudo}
                    </Link>
                  ) : (
                    <a
                      key={link.titulo}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={classes}
                    >
                      {conteudo}
                    </a>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        {/* Rodapé */}
        <footer className="mt-12 border-t border-border pt-6 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-white/50">
            Honra · Disciplina · Coragem
          </p>
          <div className="mt-4 flex items-center justify-center gap-6 text-xs">
            <Link to="/escalas" className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-primary">
              <ArrowLeft className="h-3.5 w-3.5" />
              Escalas de Serviço 2026
            </Link>
            <Link to="/sobre" className="text-muted-foreground transition-colors hover:text-primary">
              Sobre o 3º GB
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
