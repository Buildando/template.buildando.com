---
title: "Criando posts no Buildando"
description: "Um post é uma pasta com um markdown. Veja o frontmatter, imagens colocadas, rascunhos e traduções — sem tocar em código."
lang: pt
translations:
  en: writing-posts
publishDate: 2026-07-20
category: "Guia"
tags:
  - posts
  - markdown
  - guia
cover: ./cover.png
coverAlt: "Capa ilustrada: Criando posts no Buildando"
---

Com o blog [instalado e personalizado](/pt/posts/instalando-e-personalizando/),
escrever é a parte fácil — e o motivo do template existir.

## Um post é uma pasta

Para publicar, crie um diretório em `src/content/posts/` com um `index.md` dentro.
Nada mais no projeto muda.

```text
src/content/posts/
  meu-primeiro-post/
    index.md      ← o conteúdo
    capa.png      ← imagens ficam ao lado do markdown
```

O **nome da pasta** vira o endereço do post (o _slug_): `meu-primeiro-post` →
`/pt/posts/meu-primeiro-post/`.

## O frontmatter

O bloco no topo do `index.md` descreve o post. Três campos são **obrigatórios** —
o build falha avisando qual post e qual campo, caso falte algum:

```markdown
---
title: "Título do post"
description: "Resumo em uma frase — vira o snippet de busca e o preview social."
publishDate: 2026-07-20
category: "Boas Práticas"
tags: [oo, testes]
cover: ./capa.png        # imagem colocada na mesma pasta (opcional)
coverAlt: "Descrição da capa"
draft: false             # true esconde da produção
---

Seu conteúdo em **markdown** aqui.
```

Todo o resto tem padrão. O schema completo está em `src/content/config.ts`.

## Imagens

Coloque as imagens **na pasta do post** e referencie por caminho relativo. No
build elas são **otimizadas** e servidas em tamanhos responsivos (WebP), sem você
configurar nada:

```markdown
![Um diagrama](./diagrama.png)
```

Um detalhe legal: se você **não** definir uma `cover`, o post ganha
**automaticamente** um card social com a sua marca, gerado no build — assim todo
post fica com uma boa imagem ao ser compartilhado, mesmo sem você desenhar uma.

## Rascunhos

`draft: true` mantém o post no repositório mas **fora da produção**: ele aparece só
no `npm run dev` e é excluído de páginas, listagens, facetas, sitemap, RSS e busca.
Ótimo para escrever com calma antes de publicar.

## Idiomas e traduções

Cada post declara seu idioma com `lang:` e liga suas traduções com `translations:`:

```markdown
lang: pt
translations:
  en: my-first-post   # o slug da versão em inglês
```

Aí o seletor de idioma leva direto para a tradução. Se não houver tradução, ele
mantém o post e traduz só a interface da página.

## E o CSS?

Não precisa. O markdown herda a **tipografia do site** — títulos, listas, tabelas,
citações e blocos de código já saem estilizados. Escreva como você pensa.

Pronto: apague os posts de exemplo, copie uma pasta como base e comece a escrever.
