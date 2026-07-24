---
title: "What Buildando is"
description: "A static blog template in Astro: markdown content, no backend, strong SEO, and pluggable integrations. What it is and why it exists."
lang: en
translations:
  pt: o-que-e-o-buildando
publishDate: 2026-07-22
category: "Guide"
tags:
  - template
  - astro
  - about
cover: ./cover.png
coverAlt: "Cover illustration: What Buildando is — a static blog template"
---

**Buildando** is a blog _template_: a ready starting point to publish your own
blog in minutes and customize over time. It is what you are reading now — this
site is both the blog and the template anyone can clone.

If you came for the template, start here and move on to
[Installing and customizing](/en/posts/installing-and-customizing/) and
[Writing posts](/en/posts/writing-posts/).

## The idea in one sentence

> Writing a post is creating a folder with a markdown file — everything else (SEO,
> feed, search, theme, languages) is already there, with no server at all.

## No backend, on purpose

The blog is **fully static**: at build time everything the reader needs — pages,
search, feeds, structured data — becomes files any host can serve. No database, no
admin panel, no server to maintain. The two features that would normally need a
backend are delegated:

- **Search** is a static index **of the posts**, built at build time and run in the browser.
- **Comments** are GitHub Discussions (or another provider) embedded on the page.

That keeps the site fast, cheap to host, and its content versioned in git — where
text and code already feel at home.

## What's included

- **Markdown content**, one post per folder, images alongside.
- **SEO by construction**: title, description, canonical, Open Graph, Twitter
  Card, JSON-LD, `sitemap.xml`, `robots.txt`, and RSS on every page. Cover-less
  posts get an automatic branded social card.
- **Light/dark theme** with a toggle, remembered across visits.
- **Multilingual** with per-locale routes, a switcher, and `hreflang` — this post
  has a Portuguese version (switch it in the top corner).
- **Search** (posts only): a live preview in a modal (press `/` or `⌘K`) and, on
  Enter, a **results page** with the same cards as the feed. Plus a **filter** by
  category, tag, month on the home.
- Optional **share**, **newsletter**, and **analytics/ads** with a consent banner.

## Generic and contributable

Integrations (comments, search, analytics) sit behind **ports** with pluggable
**adapters**: switching from giscus to another provider is a one-word config
change. The goal is that you — or anyone — can adapt the template to your stack and
contribute new adapters.

All identity (name, colors, socials, domain) lives in **one file**
(`src/config/site.ts`), so a fork is editing that file and swapping the logo.

## Who it's for

For anyone who wants a **fast, SEO-strong, low-maintenance blog** without running a
server — and likes writing markdown with content in git. If that's you, next is
[install and customize](/en/posts/installing-and-customizing/).
