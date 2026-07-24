---
name: cpanel-static-deploy
description: Use when deploying a static site to cPanel shared hosting (e.g. HostGator) from CI — SSH shell is often disabled, so FTPS via GitHub Actions is the reliable path; covers the FTP-account directory gotcha, environment secrets, staging in a subfolder, and a one-time clean-slate cutover over an existing site.
---

# cPanel static deploy

Technique for publishing a built static site to cPanel-style shared hosting from
CI. Two transports: **rsync over SSH** (when shell is available) and **FTPS**
(when it is not). On many shared plans SSH shell is disabled, so FTPS is the
practical default — reach for it first unless you have confirmed shell access.

## Check for shell BEFORE committing to rsync

Key auth succeeding does **not** mean rsync will work. A shared account can accept
the SSH key and still have no shell — the connection prints
`Shell access is not enabled on your account` and exits. rsync runs a remote
shell, so it fails there. Test explicitly before building an rsync pipeline:

```bash
ssh -i key -p 2222 user@host 'pwd'   # prints a path → shell OK; prints the
                                     # "not enabled" message → use FTPS or ask support
```

## FTPS path (no shell needed) — the shared-hosting default

Use `SamKirkland/FTP-Deploy-Action` over **FTPS** (FTP+TLS, port 21). It syncs
incrementally via a state file it keeps on the server, so it uploads only what
changed. Pass `server`, `username`, `password`, `server-dir` from secrets.

- **FTP-account directory gotcha (bites everyone):** a dedicated cPanel FTP
  account's *Directory* defaults to a subfolder of the home
  (`/home/user/deploy@domain`), **not** `public_html` — and many cPanel builds
  **cannot edit it after creation** (only change password / quota / delete). Files
  then land outside the web root and every URL 404s. Fix: **delete and recreate**
  the account with *Directory* = `public_html`. Always **verify where files land**
  by probing a real URL after the first deploy, not by assuming.
- **`server-dir` is relative to the login root.** Keep it a secret so staging vs
  cutover is a config change, not an edit: `_preview/` for staging, `./` for the
  live root.

## rsync path (only when shell is enabled)

```bash
rsync -avzr --delete -e 'ssh -p 2222' dist/ user@host:/home/USER/public_html/
```

`--delete` mirrors (removes server files absent locally) — point it at
`public_html`, never `~`. Pass host/user/key/target/port from secrets.

## Stage in a subfolder first (zero risk to a live site)

Deploy to `public_html/_preview/` and prove the whole pipeline before touching the
live root. Caveat: a site built with **root-absolute** asset/link paths
(`/_astro/…`, `/pt/…`) renders **unstyled** under a subfolder — the HTML is there
(200) but CSS/links resolve to `/` (the live site). That is expected, not a deploy
bug: validate *files and pipeline* in the subfolder, validate *visuals* locally
(`npm run preview`) or after cutover.

## Cutover over an existing site (e.g. WordPress)

1. **Back up first**, always, even when discarding the old site.
2. The FTP action won't delete files it doesn't track, so it would leave the old
   install alongside yours. To replace it, set **`dangerous-clean-slate: true` for
   ONE run** — it wipes the target dir, then uploads clean. **Remove the flag
   immediately after** so normal deploys stay incremental instead of wiping every
   push.
3. Deleting thousands of files (a full WordPress) over FTPS is slow — expect
   10–30 min for that one run.
4. If old URLs aren't being preserved, they simply 404 (fine); ship a `404.html`.
   To keep ranking, add `301` redirects in `.htaccess` instead. A generator's own
   redirect map (Astro's `redirects`, say) is the cheaper option and travels with the
   build, but it emits a `noindex` meta-refresh stub, not a `301` — enough to keep a
   bookmarked or linked URL working, not enough to pass ranking on. Pick by whether
   the old URL was actually indexed.

## GitHub Environment secrets

If the secrets live in a named **Environment** (not repository secrets), the job
**must** declare `environment: <name>` or it reads them as empty — a silent cause
of "connected but uploaded nothing / auth failed" runs.

## Apache layer (.htaccess)

cPanel runs Apache. Ship a minimal `.htaccess` in the build output for HTTPS
canonicalization, gzip, and cache headers (immutable for fingerprinted `/_astro/`
assets, no-cache for HTML) plus `ErrorDocument 404`. Test against the live host —
shared-Apache rules are easy to get subtly wrong.

## Secrets discipline

Host, user, key/password, port, and target dir live only in CI/Environment
secrets. The repository contains no host, no credential, no key.
