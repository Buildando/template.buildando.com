---
title: "Instalando o Buildando e personalizando"
description: "Do fork ao ar: instale, rode localmente e personalize a identidade, o texto inicial da home e a página Sobre — tudo a partir de um arquivo de configuração."
lang: pt
publishDate: 2026-07-21
category: "Guia"
tags:
  - instalação
  - configuração
  - guia
cover: ./cover.png
coverAlt: "Capa ilustrada: Instalando e personalizando"
---

Você já viu [o que é o Buildando](/pt/posts/o-que-e-o-buildando/). Agora vamos
colocar o seu no ar e deixá-lo com a sua cara.

## 1. Pegue o template

O template vive em **github.com/Buildando/template.buildando.com**. Lá, clique em
**"Use this template" → Create a new repository** (ou faça um fork). Depois, clone
o **seu** repositório e instale:

```bash
git clone https://github.com/SEU-USUARIO/SEU-REPO.git
cd SEU-REPO
npm install
npm run dev      # servidor local, com recarga automática
```

Abra `http://localhost:4321` e você já verá o blog rodando. Requer Node 22+.

## 2. A única superfície de configuração

Quase tudo que é "seu" mora em **um arquivo**: `src/config/site.ts`. É lá que você
edita nome, domínio, autor, a **skin** (cores e fontes — veja a seção 5), **redes
sociais**, navegação, idiomas e as integrações (comentários, busca, analytics).

```ts
export const SITE = {
  name: "Meu Blog",
  url: "https://meu-dominio.com",
  author: "Seu Nome",
  // ...
};
```

> Regra de ouro: se `buildando`, o domínio ou o autor aparecerem **fora** desse
> arquivo, é bug. Isso é o que torna o fork tão simples.

Troque também os assets em `public/`: o `favicon.svg` (logo) e o `og-default.svg`
(imagem social padrão).

## 3. O texto inicial da home (antes do feed)

Aquele bloco no topo da home — título e frase de boas-vindas, antes da lista de
posts — é **markdown livre**, um por idioma, em `src/content/home/`:

```text
src/content/home/
  pt.md      ← o hero em português
  en.md      ← o hero em inglês
```

Edite `pt.md` com o que quiser (título, parágrafo, links) — o CSS do site cuida do
visual. Sem esse arquivo, a home cai no nome do site + descrição.

## 4. A página "Sobre o Autor"

A página **Sobre** vive em `src/pages/[lang]/about.astro`. O texto por idioma está
logo no topo do arquivo — troque pelo seu. O link no menu já aponta para ela.

## 5. Identidade visual (skins)

A cara do blog — paletas light/dark, fontes e largura de leitura — é uma **skin**:
um preset de tokens em `src/config/skins.ts`. Trocar de identidade é **uma linha**
no `site.ts`:

```ts
export const ACTIVE_SKIN: SkinName = "editorial";
```

Já vêm prontas seis:

- **`terminal`** — padrão: escuro, acento azul, Inter + Space Grotesk
- **`editorial`** — títulos em serifa, papel quente, acento verde
- **`mono`** — títulos monoespaçados, alto contraste, acento âmbar
- **`minimal`** — quase monocromático, acento lime discreto
- **`warmDev`** — a paleta Solarized
- **`brutalist`** — radical: bordas duras, cantos retos, sombras offset, acento violeta

Cada uma vem com light **e** dark (o botão de tema alterna). Para criar a sua,
copie um preset em `skins.ts` e edite os valores — são CSS puro. Uma skin pode até
mudar **estrutura** (não só cor): regras escopadas por `[data-skin="nome"]` em
`src/styles/skins.css` — a `brutalist` é o exemplo. Mais detalhes na seção
**Skins** do `README`.

## 6. Ajustes rápidos comuns

- **Tema padrão**: `THEME.default` (`"dark"` ou `"light"`), ou trave com `allowToggle: false`.
- **Idiomas**: adicione/remova em `I18N` e traduza as strings em `src/i18n/ui.ts`.
  Só um idioma? Deixe apenas um locale.
- **Comentários / busca**: escolha o provedor em `INTEGRATIONS`
  (veja `src/integrations/README.md`).
- **Analytics, anúncios, newsletter, compartilhar**: cada um é opt-in num bloco de
  config; vazio = não aparece.

## 7. Publicando

`npm run build` gera a pasta `dist/` estática, que serve em **qualquer**
hospedagem. O template já inclui um workflow de deploy automático via GitHub
Actions (veja o `README`) — é só apontá-lo para o seu host.

Pronto — o esqueleto é seu. O próximo passo é o que mais importa:
[criar posts](/pt/posts/criando-posts/).
