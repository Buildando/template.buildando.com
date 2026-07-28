---
title: "Instalando o Buildando e personalizando"
description: "Do fork ao ar: instale, rode localmente e personalize a identidade, o texto inicial da home e a página Sobre — tudo a partir de um arquivo de configuração."
lang: pt
translations:
  en: installing-and-customizing
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

O template vive em
[github.com/Buildando/template.buildando.com](https://github.com/Buildando/template.buildando.com).
Lá, clique em **"Use this template" → Create a new repository** (ou faça um fork).
Depois, clone o **seu** repositório e instale:

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

## 6. Um idioma ou vários

O template vem bilíngue (português e inglês), mas isso é configuração, não estrutura.
Quem manda é o bloco `I18N`:

```ts
export const I18N = {
  defaultLocale: "pt",
  locales: [
    { code: "pt", label: "Português", htmlLang: "pt-BR", ogLocale: "pt_BR" },
    { code: "en", label: "English",   htmlLang: "en",    ogLocale: "en_US" },
  ],
} as const;
```

**Para deixar só um idioma**, apague a linha do outro. O seletor de idioma some
sozinho do cabeçalho, e todas as URLs continuam prefixadas (`/pt/...`). Apague
também o hero do idioma removido em `src/content/home/` e os posts escritos nele —
um post com `lang:` que não existe mais faz o build falhar, dizendo qual post é.

**Para adicionar um idioma**, some uma linha em `locales` e traduza as strings em
`src/i18n/ui.ts`. Não precisa adivinhar o que falta: rode `npm test` e o
`config-integrity.test.ts` lista exatamente as chaves que o novo idioma ainda deve.

Cada post declara o idioma em que está escrito e liga suas traduções — isso é
assunto do post [criando posts](/pt/posts/criando-posts/). O que vale saber aqui é
que **nada obriga a traduzir tudo**: um post sem tradução continua acessível nos
outros idiomas, com a interface traduzida e o conteúdo no idioma original.

## 7. Logo, favicon e imagens sociais

Três arquivos e um campo:

```text
public/favicon.svg      ← logo do cabeçalho E ícone da aba
public/og-default.svg   ← imagem social de páginas sem imagem própria
src/assets/author.jpg   ← foto na página Sobre
```

O logo do cabeçalho vem de `SITE.logo`, que aponta para `/favicon.svg` — troque o
arquivo mantendo o nome, ou mude o campo. Como é SVG, ele fica nítido em qualquer
tamanho e não pesa nada.

Posts não precisam de imagem: quem não define `cover` ganha automaticamente um card
social gerado no build, com a sua marca e as cores da skin.

## 8. Redes sociais e compartilhamento

São dois blocos diferentes. `SOCIAL` são os seus perfis, que viram ícones no rodapé:

```ts
export const SOCIAL = [
  { label: "GitHub", href: "https://github.com/seu-usuario", icon: "github" },
  { label: "LinkedIn", href: "https://linkedin.com/in/voce", icon: "linkedin" },
] as const;
```

O `icon` é um slug do [simple-icons](https://simple-icons.org). Já vêm prontos:
`github`, `instagram`, `threads`, `x`, `tiktok`, `facebook`, `linkedin`, `youtube`,
`telegram`, `whatsapp` e `rss`. Um slug desconhecido simplesmente não desenha nada —
para acrescentar outro, edite `src/components/Icon.astro`. Lista vazia: rodapé sem
ícones.

`SHARE` é outra coisa: são os botões de compartilhar **no rodapé de cada post**.

```ts
export const SHARE = {
  networks: ["x", "whatsapp", "telegram", "linkedin", "facebook"],
  copyLink: true,   // botão de copiar o link
  native: true,     // menu de compartilhar do celular, quando houver
} as const;
```

## 9. Ligando as integrações

Cada integração é opt-in e **vazio significa desligado** — o template no estado em
que você o clonou não faz nenhuma requisição a terceiros.

**Comentários (GitHub Discussions via giscus).** Escolha o provedor e preencha os
ids:

```ts
INTEGRATIONS.comments = "giscus";   // "giscus" | "utterances" | "none"
```

Os ids saem de [giscus.app](https://giscus.app), depois de: deixar um repositório
público, ativar **Discussions** nele e instalar o app do giscus. Cole `repoId` e
`categoryId` no bloco `GISCUS`. Enquanto `repoId` estiver vazio, nem a seção de
comentários aparece. Dica: aponte para um repositório **separado** só de
comentários, e o código do seu blog pode continuar privado.

Deixe `theme: "site"` para os comentários seguirem o botão de tema do blog. O padrão
do próprio giscus (`preferred_color_scheme`) segue o sistema operacional, o que
deixa os comentários escuros para quem colocou o site no claro.

**Busca.** `INTEGRATIONS.search = "pagefind"` liga a busca; `"none"` desliga. O
índice é gerado no build e roda no navegador — não há servidor de busca.

**Google Analytics.** Cole só o ID de medição, não o script inteiro:

```ts
ANALYTICS.googleAnalytics = "G-XXXXXXXXXX";
```

Isso liga junto o banner de consentimento: o GA **não** carrega antes do aceite, e
recusar apaga os cookies. Com analytics ligado você passa a ter obrigações de
privacidade — preencha `CONSENT.privacyUrl` e `CONSENT.contact`, que alimentam a
página de política e o link do banner.

**Plausible.** `ANALYTICS.plausible = "seu-dominio.com"`. Não usa cookies, então não
dispara banner nenhum.

**AdSense.** `ANALYTICS.adsense = "ca-pub-..."` carrega o script e passa a exigir
consentimento; a meta tag de associação da conta é emitida sozinha a partir desse
mesmo valor. Faltam duas coisas que só existem fora do código: criar `public/ads.txt`
com a linha que o AdSense fornece, e ativar os formatos no painel — em *Anúncios →
Por site*.

Se preferir controlar onde o anúncio entra, em vez de deixar o Google decidir, use o
componente `src/components/AdUnit.astro` com o slot criado no painel. **Nenhuma
página o usa por padrão**: sem posicioná-lo, só valem os formatos automáticos.

**Newsletter.** Vale esclarecer uma confusão comum antes: **RSS não manda e-mail**.
O feed é um arquivo que o seu site publica; quem o consulta é um leitor de feeds.
Para chegar em e-mail é preciso um provedor no meio.

`NEWSLETTER.actionUrl` recebe o endpoint do formulário desse provedor. Ele aceita um
endpoint único ou **um por idioma**:

```ts
actionUrl: "https://buttondown.com/api/emails/embed-subscribe/USUARIO"
actionUrl: { pt: "…/USUARIO-pt", en: "…/USUARIO-en" }
```

Num blog multilíngue prefira um por idioma: o feed é por idioma, então a lista
alimentada por ele também é, e quem assina lendo em inglês não deveria receber posts
em português. Idioma sem endpoint simplesmente não mostra o formulário — melhor
nenhum formulário do que inscrever a pessoa na lista errada.

O ciclo se fecha no painel do provedor: ative o **RSS-to-email** de cada lista
apontando para o feed correspondente (`/pt/rss.xml`, `/en/rss.xml`). A partir daí
publicar um post envia o e-mail sozinho. O formulário é HTML puro que posta direto no
provedor — nenhum dado de assinante passa pelo seu site, que continua estático.

## 10. RSS

Não tem o que configurar: o feed é gerado sozinho, **um por idioma**, em
`/pt/rss.xml` e `/en/rss.xml`. Ele já sai anunciado no `<head>` de todas as páginas,
então leitores de feed encontram sozinhos, e há um ícone no rodapé. Título,
descrição e domínio vêm do `SITE` — trocar a identidade no passo 2 já acerta o feed.

Rascunhos nunca entram no feed.

## 11. Publicando

`npm run build` gera a pasta `dist/` estática, que serve em **qualquer**
hospedagem: armazenamento de objetos, CDN, host estático ou hospedagem
compartilhada tradicional.

O template **não traz** um workflow de deploy, de propósito: automação pertence a um
site concreto, com host e credenciais próprios, e um workflow que não consegue rodar
vira CI vermelho em todo fork antes de a pessoa ter decidido qualquer coisa. Quando
você tiver hospedagem, a seção **Deploying** do `README` descreve os dois caminhos
que cobrem hospedagem compartilhada — rsync por SSH e FTPS — com as armadilhas de
cada um.

Antes de publicar, `npm test` vale o minuto que leva: além de checar o build, ele
verifica se a sua configuração é coerente — idioma sem tradução, skin que não
existe, consentimento desligado com analytics ligado.

Pronto — o esqueleto é seu. O próximo passo é o que mais importa:
[criar posts](/pt/posts/criando-posts/).
