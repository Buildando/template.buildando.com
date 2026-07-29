---
title: "Instalando o Buildando e personalizando"
description: "Instale, personalize a identidade e ligue as integrações: idiomas, comentários, analytics, anúncios e newsletter — inclusive o que cada uma exige fora do código."
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

Cada integração é opt-in e **vazio significa desligado**: o template no estado em que
você o clonou não faz uma única requisição a terceiros. Ligue só o que for usar — e
cada uma que você liga muda o que a política de privacidade declara, automaticamente.

### 9.1 Comentários com GitHub Discussions (giscus)

O giscus exibe uma discussão do GitHub dentro do post. Não há banco de dados: os
comentários vivem no GitHub.

1. **Crie um repositório público só para os comentários** — por exemplo
   `seu-usuario/meu-blog-comments`. Ele precisa ser público, mas o repositório do
   **blog pode continuar privado**: são coisas separadas, e é por isso que vale um
   repositório dedicado.
2. Nesse repositório, vá em *Settings → General → Features* e marque **Discussions**.
3. Instale o app do giscus nele: [github.com/apps/giscus](https://github.com/apps/giscus).
4. Abra [giscus.app](https://giscus.app) e informe `dono/repositório`. A página valida
   os três pré-requisitos acima e, se estiver tudo certo, devolve **`repoId`** e
   **`categoryId`** — escolha a categoria *Announcements*, que é de anúncio e evita
   que qualquer pessoa abra tópicos soltos.
5. Cole no bloco `GISCUS`:

```ts
export const GISCUS = {
  repo: "seu-usuario/meu-blog-comments",
  repoId: "R_kg...",
  category: "Announcements",
  categoryId: "DIC_kw...",
  mapping: "pathname",   // cada URL de post vira uma discussão
  theme: "site",
} as const;
```

`mapping: "pathname"` liga o post à discussão pelo caminho da URL. Isso significa que
**renomear a pasta de um post órfã os comentários dele** — a discussão antiga continua
lá, apontando para um endereço que não existe mais.

Deixe `theme: "site"` para os comentários seguirem o botão de tema do blog. O padrão
do próprio giscus, `preferred_color_scheme`, segue o **sistema operacional**: quem
puser o site no claro com o sistema no escuro fica com comentários escuros no meio de
uma página clara.

Enquanto `repoId` estiver vazio, a seção inteira não é renderizada — sem título, sem
script, sem requisição.

### 9.2 Google Analytics

Do snippet que o Google entrega, o blog precisa de **uma coisa só**: o ID de medição.

1. No Google Analytics, crie uma propriedade GA4 e um fluxo de dados para o seu
   domínio. Ele devolve um ID no formato `G-XXXXXXXXXX`.
2. Cole na config:

```ts
ANALYTICS.googleAnalytics = "G-XXXXXXXXXX";
```

Não cole o `<script>`: o blog emite exatamente as mesmas chamadas `gtag`, só que
**depois do consentimento**. Ligar o GA acende três coisas de uma vez:

- o **banner de cookies** passa a aparecer;
- a **política de privacidade** ganha a seção sobre o Google Analytics;
- o rodapé ganha **Preferências de cookies**, para quem quiser mudar de ideia.

Por isso, preencha o bloco `CONSENT` junto (seção 9.5). Para conferir que está certo,
veja o HTML publicado: não pode existir nenhuma `<script src="...googletagmanager...">`
na página — o endereço só aparece dentro da fila de consentimento.

**Plausible** é a alternativa sem cookies: `ANALYTICS.plausible = "seu-dominio.com"`.
Como não grava cookie, não dispara banner nenhum.

### 9.3 AdSense

Só faz sentido depois que o AdSense **aprovar o seu site** — a aprovação olha volume e
originalidade de conteúdo, e um blog recém-criado costuma esperar.

São três peças, em três lugares diferentes:

1. **O publisher ID**, na config:

```ts
ANALYTICS.adsense = "ca-pub-0000000000000000";
```

2. **O `ads.txt`**, na raiz do site. Crie `public/ads.txt` com a linha exata que o
   AdSense fornece — tudo em `public/` vai para a raiz do domínio, e é lá que o Google
   procura:

```text
google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0
```

3. **Os formatos, no painel do AdSense**, em *Anúncios → Por site*. Sem esse passo o
   script carrega e **nenhum anúncio aparece** — sintoma idêntico ao de um bug.

A meta tag de verificação da conta você não precisa colar: ela é emitida sozinha a
partir do publisher ID. E, como toda a publicidade fica atrás do consentimento, quem
recusar cookies não vê anúncio — comportamento correto, e receita menor do que o
painel projeta.

Os formatos automáticos deixam o Google decidir onde inserir, inclusive entre
parágrafos e fixo no rodapé. Se preferir mandar você, posicione
`src/components/AdUnit.astro` com um slot criado no painel — **nenhuma página o usa
por padrão**.

### 9.4 Newsletter

Antes de tudo, uma confusão que custa tempo: **RSS não envia e-mail**. O feed é um
arquivo que o site publica; quem o lê é um leitor de feeds. Para chegar numa caixa de
entrada é preciso um provedor no meio, e é ele quem transforma "saiu post novo" em
mensagem.

**Escolha um provedor com RSS-to-email.** Atenção ao plano: vários cobram justamente
por esse automatismo, mesmo com poucos assinantes. Vale conferir antes de criar conta.

**Crie uma lista por idioma.** O feed é por idioma, então a lista alimentada por ele
também é — quem assina lendo em inglês não deveria receber post em português.

**Pegue os campos reais do formulário, não o iframe.** Este é o passo onde é fácil se
enganar: provedores oferecem "compartilhar por iframe" ou um link pronto, mas o que
você precisa é do **formulário HTML**. Se só houver o link, abra a página hospedada do
formulário e leia o HTML dela — lá estão as três coisas que importam:

- o `action` (para onde o formulário posta);
- o **nome do campo de e-mail**, que muitas vezes não é `email` (a Brevo usa `EMAIL`);
- os **campos escondidos**, incluindo o **honeypot anti-robô** — um campo que precisa
  ser enviado **vazio**.

Postar sem esses campos é o pior tipo de falha: o provedor **aceita** a requisição e
não cadastra ninguém. O formulário parece funcionar.

```ts
export const NEWSLETTER = {
  actionUrl: {
    pt: "https://provedor.exemplo/serve/AAA",
    en: "https://provedor.exemplo/serve/BBB",
  },
  emailField: "EMAIL",
  hiddenFields: {
    pt: { locale: "pt", email_address_check: "" },
    en: { locale: "en", email_address_check: "" },
  },
} as const;
```

Idioma sem endpoint simplesmente não mostra formulário — melhor nenhum formulário do
que inscrever a pessoa na lista errada.

**Feche o ciclo no painel:** crie uma integração de RSS-to-email por lista, apontando
para o feed correspondente (`/pt/rss.xml`, `/en/rss.xml`). A partir daí, publicar um
post envia o e-mail sozinho. Duas coisas a vigiar no primeiro disparo: muitos
provedores puxam vários itens de uma vez, e o seu feed já tem posts — confira quantos
ele pretende enviar antes de deixar rodar; e costuma haver uma janela de cerca de uma
hora entre publicar e disparar.

Com JavaScript, o envio acontece em segundo plano e a pessoa fica na página; sem
JavaScript, o formulário posta normalmente. Nenhum dado de assinante passa pelo seu
site.

### 9.5 Consentimento e política de privacidade

Este bloco não liga integração nenhuma — ele governa o que as outras obrigam:

```ts
export const CONSENT = {
  required: true,
  privacyUrl: "/privacy",
  contact: "privacidade@seu-dominio.com",
} as const;
```

`contact` é o endereço que a política oferece para pedidos de titular (LGPD, art. 18).
Crie a caixa antes de publicar: uma política que aponta para um e-mail inexistente é
pior do que não ter o campo.

A página de privacidade **se monta sozinha a partir da configuração**. Você não
escreve nem mantém esse texto: se o Google Analytics estiver ligado, aparece a seção
dele; se houver newsletter naquele idioma, aparece a seção da newsletter; se não
houver anúncios, some a frase que os menciona. E se **nada** estiver ligado — sem
analytics, sem anúncios, sem comentários e sem formulário —, não existe página de
privacidade, nem link no rodapé, nem banner: um blog que não coleta nada não precisa
declarar nada.

Vale ler a página depois de configurar tudo. Ela descreve o comportamento real do
site, mas quem responde pelo texto é você.

### 9.6 Busca

Nada a configurar além de ligar ou desligar: `INTEGRATIONS.search = "pagefind"` ou
`"none"`. O índice é gerado no build, separado por idioma, e roda no navegador — não
existe servidor de busca para manter.

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
