# Deployment

> **Status: deployed.** Each merge to `main` that passes CI is published to GitHub Pages at https://fretdex.seannormoyle.net, and installs as an app on a phone that keeps working offline.

## Target

Static files on GitHub Pages, served over HTTPS from the root of their own subdomain. There's no server, backend or database: everything the app stores stays on the phone (see [architecture.md](architecture.md#storage)).

## How a deploy works

- **Trigger:** the `deploy` job in `.github/workflows/ci.yml` runs on every push to `main` once the format, lint, type check, unit test and smoke test jobs pass. To deploy `main` again without a new merge, run the CI workflow on `main` from the repository's Actions tab.
- **Build:** `npm run build` writes the static site to `app/build/`: Home, Settings and the module lists prerendered to HTML, `404.html` (the fallback page that draws every card in the browser, which Pages serves for any path it has no file for), the app's JavaScript and CSS in `_app/`, the files in `app/static/`, the manifest (`manifest.webmanifest`) and the service worker (`sw.js`).
- **Publish:** GitHub's Pages actions upload `app/build/` and deploy it to the `github-pages` environment. The run's summary links the live site.

## Updates on the phone

The service worker (made by `@vite-pwa/sveltekit` from the options in `app/vite.config.ts`) precaches the whole build, so after the first load the app opens with no network (APP-4.2). Each time the app opens with a network, the browser checks `sw.js` for a change. When a deploy has changed it, the new version downloads in the background, takes over and reloads the app, usually within a few seconds of opening it (APP-4.3). Nothing needs clearing.

## Installing

- **Android (Chrome):** open https://fretdex.seannormoyle.net, then the ⋮ menu → **Add to home screen** → **Install**.
- **iPhone (Safari):** open the site, then **Share** → **Add to Home Screen**.

To check offline use, open the installed app once, turn on airplane mode, close it fully and open it again.

## One-time setup

Done once, on 2026-11-25; recorded here in case it ever needs redoing.

- **Domain verification:** `seannormoyle.net` is verified in the GitHub account's Pages settings (github.com → Settings → Pages), through a TXT record named `_github-pages-challenge-cynicollision` in the domain's DNS. It stays in place, so no other GitHub account can publish to a subdomain of `seannormoyle.net`.
- **DNS:** a CNAME record `fretdex` pointing at `cynicollision.github.io`. The domain's DNS is managed at Squarespace (Domains → seannormoyle.net → DNS → DNS Settings → Custom records); the personal site's own records sit beside it, untouched.
- **Repository:** Settings → Pages has the source set to **GitHub Actions**, the custom domain `fretdex.seannormoyle.net`, and **Enforce HTTPS** on. GitHub issues and renews the HTTPS certificate itself.

If the domain's DNS ever moves to another provider, recreate both records there, with the same names and values.

## Troubleshooting

- **The custom domain shows a DNS error in Settings → Pages:** check the `fretdex` CNAME record, then **Remove** and re-enter the domain to make GitHub check again.
- **Enforce HTTPS is greyed out:** GitHub hasn't issued the certificate yet. It usually takes minutes, and up to a day after the domain is first set.
- **A deploy didn't show up on the phone:** open the app with a network and wait a few seconds for it to reload. If it still shows the old version, check that the deploy job passed in the Actions tab.
