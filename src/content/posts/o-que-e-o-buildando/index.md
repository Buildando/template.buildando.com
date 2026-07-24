---
title: "O que é o Buildando"
description: "Um template de blog estático em Astro: conteúdo em markdown, sem backend, SEO forte e integrações plugáveis. Entenda o que é e por que existe."
lang: pt
translations:
  en: what-is-buildando
publishDate: 2026-07-22
category: "Guia"
tags:
  - template
  - astro
  - sobre
cover: ./cover.png
coverAlt: "Capa ilustrada: O que é o Buildando — template de blog estático"
---

**Buildando** é um _template_ de blog: um ponto de partida pronto para você
publicar seu próprio blog em minutos e ir personalizando aos poucos. É o que você
está lendo agora — este site é ao mesmo tempo o blog e o template que qualquer
pessoa pode clonar.

Se você chegou aqui por causa do template, comece por este post e siga para
[Instalando e personalizando](/pt/posts/instalando-e-personalizando/) e
[Criando posts](/pt/posts/criando-posts/).

## A ideia em uma frase

> Escrever um post é criar uma pasta com um markdown — o resto (SEO, feed, busca,
> tema, idiomas) já vem pronto e sem servidor nenhum.

## Sem backend, de propósito

O blog é **totalmente estático**: no build, tudo que o leitor precisa — páginas,
busca, feeds, dados estruturados — vira arquivos que qualquer hospedagem serve.
Não há banco de dados, painel de administração nem servidor para manter. As duas
funções que normalmente exigiriam um backend são delegadas:

- **Busca** é um índice estático **dos posts**, gerado no build e rodando no navegador.
- **Comentários** são o GitHub Discussions (ou outro provedor) embutido na página.

Isso deixa o site rápido, barato de hospedar e com o conteúdo versionado no git —
onde texto e código já se sentem em casa.

## O que já vem pronto

- **Conteúdo em markdown**, um post por pasta, com imagens ao lado.
- **SEO por construção**: título, descrição, canonical, Open Graph, Twitter Card,
  JSON-LD, `sitemap.xml`, `robots.txt` e RSS — gerados em toda página, sem esforço.
  Posts sem capa ganham automaticamente um card social com a sua marca.
- **Tema claro/escuro** com botão, lembrado entre visitas.
- **Multi-idiomas** com rotas por idioma, seletor e `hreflang` — este post, por
  exemplo, tem uma versão em inglês (troque no canto superior).
- **Busca** só de posts: preview no modal (tecle `/` ou `⌘K`) e, no Enter, uma
  **página de resultados** com os mesmos cards do feed. Mais o **filtro** por
  categoria, tag e mês na home.
- **Compartilhar**, **newsletter** e **analytics/anúncios** opcionais, com banner
  de consentimento.

## Genérico e contribuível

As integrações (comentários, busca, analytics) ficam atrás de **portas** com
**adaptadores** plugáveis: trocar de giscus para outro provedor é mudar uma
palavra na configuração. A ideia é que você — ou qualquer pessoa — consiga adaptar
o template à sua stack e contribuir com novos adaptadores.

Toda a identidade (nome, cores, redes, domínio) mora em **um único arquivo**
(`src/config/site.ts`), então um fork é editar esse arquivo e trocar o logo.

## Para quem é

Para quem quer um blog **rápido, com SEO forte e simples de manter**, sem lidar
com servidor — e gosta de escrever em markdown com o conteúdo no git. Se é você,
o próximo passo é [instalar e personalizar](/pt/posts/instalando-e-personalizando/).
