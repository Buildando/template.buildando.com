---
title: "Writing posts in Buildando"
description: "A post is a folder with a markdown file. Frontmatter, colocated images, drafts, and translations — without touching any code."
lang: en
translations:
  pt: criando-posts
publishDate: 2026-07-20
category: "Guide"
tags:
  - posts
  - markdown
  - guide
cover: ./cover.png
coverAlt: "Cover illustration: Writing posts in Buildando"
---

With the blog [installed and customized](/en/posts/installing-and-customizing/),
writing is the easy part — and the reason the template exists.

## A post is a folder

To publish, create a directory in `src/content/posts/` with an `index.md` inside.
Nothing else in the project changes.

```text
src/content/posts/
  my-first-post/
    index.md      ← the content
    cover.png     ← images live next to the markdown
```

The **folder name** becomes the post's address (its _slug_): `my-first-post` →
`/en/posts/my-first-post/`.

## The frontmatter

The block at the top of `index.md` describes the post. Three fields are
**required** — the build fails and names the post and the field when one is
missing:

```markdown
---
title: "Post title"
description: "A one-sentence summary — it becomes the search snippet and the social preview."
publishDate: 2026-07-20
category: "Best Practices"
tags: [oo, testing]
cover: ./cover.png       # image colocated in the same folder (optional)
coverAlt: "Description of the cover"
draft: false             # true hides it from production
---

Your content in **markdown** here.
```

Everything else has a default. The full schema lives in `src/content/config.ts`.

## Images

Put images **in the post's folder** and reference them by relative path. At build
time they are **optimized** and served in responsive sizes (WebP), with nothing
for you to configure:

```markdown
![A diagram](./diagram.png)
```

A nice detail: if you set **no** `cover`, the post **automatically** gets a
branded social card, generated at build — so every post has a good image when
shared, even when you draw none.

## Drafts

`draft: true` keeps the post in the repository but **out of production**: it shows
up only under `npm run dev` and is excluded from pages, listings, facets, sitemap,
RSS, and search. Great for writing at your own pace before publishing.

## Languages and translations

Every post declares its language with `lang:` and links its translations with
`translations:`:

```markdown
lang: en
translations:
  pt: meu-primeiro-post   # the slug of the Portuguese version
```

The language switcher then goes straight to the translation. When there is none,
it keeps you on the post and translates only the page's interface.

## What about CSS?

You need none. Markdown inherits the **site's typography** — headings, lists,
tables, quotes, and code blocks come out styled already. Write the way you think.

That's it: delete the example posts, copy a folder as a base, and start writing.
