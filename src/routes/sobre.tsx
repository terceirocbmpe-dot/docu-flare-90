import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import {
  Shield,
  Flame,
  Axe,
  Phone,
  Mail,
  MapPin,
  LifeBuoy,
  Waves,
  HeartPulse,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import brasao from "@/assets/sobre/brasao-3gb.png.asset.json";
import heroBg from "@/assets/sobre/hero-sertao-chamas.jpg";
import gViaturas from "@/assets/sobre/galeria-viaturas.jpg";
import gEquipe from "@/assets/sobre/galeria-equipe.jpg";
import gTreinamento from "@/assets/sobre/galeria-treinamento.jpg";
import gOperacao from "@/assets/sobre/galeria-operacao.jpg";
import gSertao from "@/assets/sobre/galeria-sertao.jpg";
import gResgate from "@/assets/sobre/galeria-resgate.jpg";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "3º Grupamento de Bombeiros — Honra, Disciplina e Coragem" },
      {
        name: "description",
        content:
          "Conheça a história, missão e serviços do 3º Grupamento de Bombeiros: combate a incêndio, resgate, salvamento e prevenção a serviço da comunidade.",
      },
      { property: "og:title", content: "3º Grupamento de Bombeiros — Honra, Disciplina e Coragem" },
      {
        property: "og:description",
        content:
          "Conheça a história, missão e serviços do 3º Grupamento de Bombeiros: combate a incêndio, resgate, salvamento e prevenção a serviço da comunidade.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://docu-flare-90.lovable.app/sobre" },
      { property: "og:image", content: "https://docu-flare-90.lovable.app/og-3gb.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://docu-flare-90.lovable.app/sobre" }],
  }),
  component: SobrePage,
});

function useReveal() {
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const els = root.querySelectorAll<HTMLElement>(".gb-reveal");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return ref;
}

const valores = [
  { icon: Shield, title: "Missão", text: "Proteger vidas, patrimônio e meio ambiente com excelência operacional e respeito ao cidadão." },
  { icon: ShieldCheck, title: "Visão", text: "Ser referência nacional em prontidão, capacitação e atendimento humanizado em emergências." },
  { icon: Flame, title: "Valores", text: "Honra, disciplina, coragem, lealdade e compromisso inabalável com a comunidade." },
];

const servicos = [
  { icon: Flame, title: "Combate a Incêndio", text: "Resposta rápida a incêndios urbanos, florestais e industriais com equipamentos especializados." },
  { icon: LifeBuoy, title: "Resgate", text: "Operações de resgate em altura, espaços confinados e acidentes de trânsito." },
  { icon: Waves, title: "Salvamento Aquático", text: "Equipes treinadas para salvamento em rios, açudes e ambientes alagados." },
  { icon: ShieldCheck, title: "Prevenção", text: "Vistorias, análise de projetos e educação pública em segurança contra incêndio." },
  { icon: HeartPulse, title: "Atendimento Pré-Hospitalar", text: "Suporte básico e avançado de vida em ocorrências emergenciais." },
];

const galeria = [
  { src: gViaturas, alt: "Viatura de resgate do 3º GB" },
  { src: gEquipe, alt: "Equipe operacional em formação" },
  { src: gTreinamento, alt: "Treinamento operacional com fogo controlado" },
  { src: gResgate, alt: "Operação de resgate em altura" },
  { src: gSertao, alt: "Paisagem do sertão nordestino" },
  { src: gOperacao, alt: "Combate a incêndio florestal" },
];

function SobrePage() {
  const ref = useReveal();

  return (
    <main
      ref={ref as React.RefObject<HTMLElement>}
      style={{ fontFamily: "var(--font-sans)" }}
      className="min-h-screen bg-[oklch(0.14_0.04_260)] text-white"
    >
      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-[oklch(0.14_0.04_260/0.65)] border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <a href="#topo" className="flex items-center gap-3">
            <img src={brasao.url} alt="Brasão 3º GB" width={36} height={36} className="h-9 w-9 object-contain" />
            <span style={{ fontFamily: "var(--font-display)" }} className="text-lg font-semibold tracking-wide">
              3º <span className="text-[var(--gb-gold)]">GB</span>
            </span>
          </a>
          <nav className="hidden md:flex items-center gap-7 text-sm text-white/80">
            <a href="#historia" className="hover:text-[var(--gb-gold)] transition-colors">História</a>
            <a href="#missao" className="hover:text-[var(--gb-gold)] transition-colors">Missão</a>
            <a href="#servicos" className="hover:text-[var(--gb-gold)] transition-colors">Serviços</a>
            <a href="#galeria" className="hover:text-[var(--gb-gold)] transition-colors">Galeria</a>
            <a href="#contato" className="hover:text-[var(--gb-gold)] transition-colors">Contato</a>
          </nav>
          <Link to="/">
            <Button
              size="sm"
              className="bg-[var(--gb-red)] hover:bg-[var(--gb-red)]/90 text-white border border-[var(--gb-gold)]/40"
            >
              Controle de Férias
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section id="topo" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <img
          src={heroBg}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.14_0.04_260/0.85)] via-[oklch(0.14_0.04_260/0.6)] to-[oklch(0.14_0.04_260)]" />
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <img
            src={brasao.url}
            alt="Brasão do 3º Grupamento de Bombeiros"
            width={1024}
            height={1024}
            className="gb-brasao-glow mx-auto h-44 w-44 md:h-56 md:w-56 object-contain"
          />
          <h1
            style={{ fontFamily: "var(--font-display)" }}
            className="mt-8 text-5xl md:text-7xl font-bold tracking-tight"
          >
            3º Grupamento de <span className="text-[var(--gb-gold)]">Bombeiros</span>
          </h1>
          <p className="mt-5 text-lg md:text-xl text-white/85 italic" style={{ fontFamily: "var(--font-display)" }}>
            Honra, Disciplina e Coragem — a serviço da vida.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a href="#historia">
              <Button size="lg" className="bg-white text-[var(--gb-navy)] hover:bg-[var(--gb-gold)] hover:text-[var(--gb-navy)] transition-colors">
                Conheça
              </Button>
            </a>
            <a href="tel:193">
              <Button size="lg" className="bg-[var(--gb-red)] hover:bg-[var(--gb-red)]/90 text-white shadow-lg shadow-[var(--gb-red)]/30">
                <Phone className="mr-1" /> Emergência 193
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* História */}
      <section id="historia" className="py-24 px-6">
        <div className="mx-auto max-w-6xl grid md:grid-cols-2 gap-12 items-center">
          <div className="gb-reveal">
            <span className="text-[var(--gb-gold)] uppercase tracking-[0.25em] text-xs">Nossa História</span>
            <h2 style={{ fontFamily: "var(--font-display)" }} className="mt-3 text-4xl md:text-5xl font-bold">
              Forjados pelo dever, guiados pela coragem.
            </h2>
            <div className="mt-6 space-y-4 text-white/80 leading-relaxed">
              <p>
                O 3º Grupamento de Bombeiros nasceu da necessidade de levar proteção e prontidão às comunidades
                do interior, enfrentando os desafios singulares do sertão nordestino.
              </p>
              <p>
                Ao longo dos anos, formamos gerações de profissionais dedicados ao serviço público, sempre
                fiéis à tradição e prontos para responder a qualquer emergência, dia ou noite.
              </p>
            </div>
          </div>
          <div className="gb-reveal relative">
            <div className="absolute -inset-3 bg-[var(--gb-gold)]/15 rounded-2xl blur-xl" aria-hidden />
            <img
              src={gEquipe}
              alt="Equipe do 3º GB em formação"
              loading="lazy"
              width={1024}
              height={768}
              className="relative rounded-2xl border border-[var(--gb-gold)]/30 shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Missão / Visão / Valores */}
      <section id="missao" className="py-24 px-6 bg-[oklch(0.18_0.05_260)]">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-2xl mx-auto gb-reveal">
            <span className="text-[var(--gb-gold)] uppercase tracking-[0.25em] text-xs">Princípios</span>
            <h2 style={{ fontFamily: "var(--font-display)" }} className="mt-3 text-4xl md:text-5xl font-bold">
              Missão, Visão e Valores
            </h2>
          </div>
          <div className="mt-14 grid md:grid-cols-3 gap-6">
            {valores.map((v) => (
              <div
                key={v.title}
                className="gb-reveal group relative rounded-2xl p-8 bg-[oklch(0.14_0.04_260)] border border-white/10 hover:border-[var(--gb-gold)]/60 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-[var(--gb-red)]/20 border border-[var(--gb-gold)]/30 text-[var(--gb-gold)]">
                  <v.icon className="h-6 w-6" />
                </div>
                <h3 style={{ fontFamily: "var(--font-display)" }} className="mt-5 text-2xl font-semibold">
                  {v.title}
                </h3>
                <p className="mt-3 text-white/75 leading-relaxed">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Serviços */}
      <section id="servicos" className="py-24 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-2xl mx-auto gb-reveal">
            <span className="text-[var(--gb-gold)] uppercase tracking-[0.25em] text-xs">O que fazemos</span>
            <h2 style={{ fontFamily: "var(--font-display)" }} className="mt-3 text-4xl md:text-5xl font-bold">
              Serviços Operacionais
            </h2>
          </div>
          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicos.map((s) => (
              <div
                key={s.title}
                className="gb-reveal rounded-2xl p-7 bg-gradient-to-br from-[oklch(0.18_0.05_260)] to-[oklch(0.14_0.04_260)] border border-white/10 hover:border-[var(--gb-gold)]/60 transition-all duration-300 hover:shadow-[0_20px_60px_-20px] hover:shadow-[var(--gb-red)]/40"
              >
                <div className="h-11 w-11 rounded-lg flex items-center justify-center bg-[var(--gb-red)] text-white shadow-lg shadow-[var(--gb-red)]/40">
                  <s.icon className="h-5 w-5" />
                </div>
                <h3 style={{ fontFamily: "var(--font-display)" }} className="mt-4 text-xl font-semibold">
                  {s.title}
                </h3>
                <p className="mt-2 text-white/75 leading-relaxed text-sm">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Galeria */}
      <section id="galeria" className="py-24 px-6 bg-[oklch(0.18_0.05_260)]">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-2xl mx-auto gb-reveal">
            <span className="text-[var(--gb-gold)] uppercase tracking-[0.25em] text-xs">Registros</span>
            <h2 style={{ fontFamily: "var(--font-display)" }} className="mt-3 text-4xl md:text-5xl font-bold">
              Galeria Institucional
            </h2>
          </div>
          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {galeria.map((g) => (
              <figure
                key={g.src}
                className="gb-reveal group relative overflow-hidden rounded-2xl border border-white/10 hover:border-[var(--gb-gold)]/60 transition-colors"
              >
                <img
                  src={g.src}
                  alt={g.alt}
                  loading="lazy"
                  width={1024}
                  height={768}
                  className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.14_0.04_260)]/80 via-transparent to-transparent" />
                <figcaption className="absolute bottom-3 left-4 right-4 text-sm text-white/90">{g.alt}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Contato */}
      <section id="contato" className="py-24 px-6">
        <div className="mx-auto max-w-6xl grid lg:grid-cols-2 gap-12">
          <div className="gb-reveal">
            <span className="text-[var(--gb-gold)] uppercase tracking-[0.25em] text-xs">Contato</span>
            <h2 style={{ fontFamily: "var(--font-display)" }} className="mt-3 text-4xl md:text-5xl font-bold">
              Estamos prontos para atender.
            </h2>
            <ul className="mt-8 space-y-4 text-white/85">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-[var(--gb-gold)] mt-0.5" />
                <span>Quartel do 3º Grupamento de Bombeiros — Sertão</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-[var(--gb-gold)] mt-0.5" />
                <a href="tel:193" className="hover:text-[var(--gb-gold)]">Emergência: 193</a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-[var(--gb-gold)] mt-0.5" />
                <a href="mailto:contato@3gb.local" className="hover:text-[var(--gb-gold)]">contato@3gb.local</a>
              </li>
            </ul>
          </div>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="gb-reveal rounded-2xl bg-[oklch(0.18_0.05_260)] border border-white/10 p-7 space-y-4"
          >
            <div>
              <label className="text-xs uppercase tracking-wider text-white/70">Nome</label>
              <input
                className="mt-1 w-full rounded-md bg-[oklch(0.14_0.04_260)] border border-white/10 px-3 py-2 text-white outline-none focus:border-[var(--gb-gold)]"
                placeholder="Seu nome"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-white/70">E-mail</label>
              <input
                type="email"
                className="mt-1 w-full rounded-md bg-[oklch(0.14_0.04_260)] border border-white/10 px-3 py-2 text-white outline-none focus:border-[var(--gb-gold)]"
                placeholder="voce@exemplo.com"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-white/70">Mensagem</label>
              <textarea
                rows={4}
                className="mt-1 w-full rounded-md bg-[oklch(0.14_0.04_260)] border border-white/10 px-3 py-2 text-white outline-none focus:border-[var(--gb-gold)] resize-none"
                placeholder="Escreva sua mensagem"
              />
            </div>
            <Button type="submit" className="w-full bg-[var(--gb-red)] hover:bg-[var(--gb-red)]/90 text-white">
              Enviar mensagem
            </Button>
            <p className="text-xs text-white/50 text-center">
              Em emergências reais, ligue imediatamente para o 193.
            </p>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[oklch(0.11_0.03_260)] py-12 px-6">
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img src={brasao.url} alt="" aria-hidden width={48} height={48} className="h-12 w-12 object-contain" />
            <div>
              <p style={{ fontFamily: "var(--font-display)" }} className="text-lg font-semibold">
                3º Grupamento de Bombeiros
              </p>
              <p className="text-xs text-white/60 italic">Honra · Disciplina · Coragem</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm text-white/60">
            <Link to="/" className="hover:text-[var(--gb-gold)]">Controle de Férias</Link>
            <span>© {new Date().getFullYear()} 3º GB</span>
          </div>
        </div>
      </footer>

      {/* Decorative axe icon (semantic flourish) */}
      <Axe className="hidden" aria-hidden />
    </main>
  );
}