
# Nova rota `/sobre` — Landing institucional do 3º GB

Adiciona uma página institucional premium em `/sobre` sem tocar na página principal de Controle de Férias, autenticação, banco de dados ou integração com Google Drive.

## Escopo

- Criar `src/routes/sobre.tsx` (TanStack Start file route).
- Adicionar um link discreto "Sobre o 3º GB" no rodapé / header da página `/` apontando para `/sobre`.
- Nenhuma alteração em `documents-center.tsx`, autenticação ou backend.

## Identidade visual

- Paleta: vermelho institucional, dourado, branco, azul escuro — adicionada como tokens em `src/styles.css` (`--gb-red`, `--gb-gold`, `--gb-navy`) sem mexer nos tokens shadcn existentes.
- Tipografia: par serifada elegante (display: Cormorant Garamond / corpo: Inter) carregada via `<link>` no `__root.tsx` head.
- Ícones: `lucide-react` (Shield, Flame, Axe, Phone, Mail, MapPin) — já instalado.
- Animações suaves reutilizando `animate-fade-in` e `hover-scale` (já no projeto) + `IntersectionObserver` simples para fade-in ao rolar.

## Estrutura da página

```text
Header fixo translúcido (backdrop-blur)
 └─ brasão · menu (História, Missão, Serviços, Galeria, Contato) · botão "Controle de Férias" → "/"

Hero cinematográfico
 └─ fundo: gradient navy + overlay de chamas/sertão (imagem gerada)
 └─ brasão central com glow dourado discreto
 └─ H1 "3º Grupamento de Bombeiros"
 └─ lema institucional
 └─ CTAs "Conheça" e "Emergência 193"

Seção História — texto institucional + imagem lateral

Missão · Visão · Valores — 3 cards com bordas douradas e ícone de escudo

Serviços — grid de 5 cards (Combate a incêndio, Resgate, Salvamento aquático, Prevenção, Atendimento pré-hospitalar)

Galeria institucional — grid responsivo (Viaturas, Equipe, Treinamentos, Brasão, Sertão, Operações)

Contato — endereço, telefone 193, e-mail + formulário apenas visual (sem submit real)

Rodapé institucional — brasão + lema + copyright
```

## Imagens

Gerar 3 imagens premium otimizadas (jpg) em `src/assets/sobre/`:
1. `hero-sertao-chamas.jpg` — fundo cinematográfico sertão + chamas sutis.
2. `brasao-3gb.png` (transparente) — brasão estilizado.
3. `galeria-collage.jpg` — composição institucional para fallback da galeria.

Demais slots da galeria reutilizam variações via `imagegen` (6 imagens leves).

## SEO

`head()` da rota `/sobre`:

- title: "3º Grupamento de Bombeiros — Honra, Disciplina e Coragem"
- meta description institucional
- og:title / og:description / og:type=website / og:url
- canonical → `https://docu-flare-90.lovable.app/sobre`
- og:image → hero gerado

## Restrições respeitadas

- Página `/` (Controle de Férias) intacta — apenas um link discreto adicionado no rodapé.
- Sem mudanças em autenticação, DB, Drive ou funcionalidades existentes.
- Sem novas dependências npm.

## Arquivos afetados

- novo: `src/routes/sobre.tsx`
- novo: `src/assets/sobre/*` (imagens)
- editado: `src/styles.css` (tokens de cor + keyframes fade-in-up se necessário)
- editado: `src/routes/__root.tsx` (link da fonte serifada no head)
- editado: arquivo da página `/` (somente para inserir o link "Sobre o 3º GB" no rodapé)
