---
title: "Exemplo de post sem tradução"
description: "Post publicado só em português para demonstrar o fallback de idioma: ele continua acessível em /en/, com a interface traduzida e o canonical apontando para cá."
lang: pt
publishDate: 2026-07-19
category: "Guia"
tags:
  - exemplo
  - idiomas
---

Este post **não declara `translations:`** — existe só em português.

Ainda assim ele é alcançável nos dois idiomas. Em `/en/posts/exemplo-sem-traducao/`
você lê o mesmo texto, mas com todo o **entorno traduzido**: menu, rodapé, títulos
de seção, formato de data e a interface de comentários saem em inglês, enquanto o
corpo continua marcado como português (`<article lang="pt-BR">`).

O `canonical` dessa página em inglês aponta de volta para a versão `/pt/`, de modo
que o conteúdo quase-duplicado não é indexado duas vezes — e o `hreflang` lista
apenas traduções de verdade, nunca páginas de fallback.

Compare com [O que é o Buildando](/pt/posts/o-que-e-o-buildando/), que declara sua
tradução: lá o seletor de idioma leva direto para o texto em inglês, e cada versão
tem canonical próprio.

Assim como o rascunho de exemplo (`draft: true`, visível só no `npm run dev`), este
post serve de demonstração do recurso e de fixture para os testes. Ele também não
define `cover`, então ganha automaticamente o card social gerado no build.
