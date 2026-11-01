<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Repository import
- Preserve the imported ROUT source structure, route handlers and design; this is a source import, not a website capture.
- Keep the managed TanStack Start and Cloudflare configuration; MDX catalog plugins are required by the imported documentation.
- Retain the imported Better Auth cookie-session architecture until explicitly migrated; Cloud connection alone does not configure the original database or external services.
- Do not apply imported database scripts automatically; they require review against the target service and existing schema.
- Subdirectories may have their own AGENTS.md; read those rules before changing their files.
- Bio assistance uses pure browser-safe helpers and updates the Studio draft through its existing callback; only the existing explicit persistence path saves data, so formatting never writes automatically or fabricates translated text.
- Contact triage remains deterministic behind the existing staff permission boundary; local helpers and tests must not depend on external AI SDKs or provider credentials.
- Authentication configuration readiness is checked before challenges, mail and passkeys, and shared with the sign-in UI; this detects missing configuration without replacing Better Auth or bypassing its safety checks.
- Static images and icons stay as real files in `public/` and `src/assets/`, not externalized pointers. Why: the app is also deployed outside Lovable (Vercel), where Lovable-hosted asset paths do not exist.
- Deferred `sql` queries capture the database context at creation time (`src/lib/neon.ts`). Why: `withDbContext(ctx, () => sql\`...\`)` is awaited after the context ends; losing it broke the post-sign-in account link.
- The official bunny logo shape lives in `public/logo.svg` and `src/assets/rout-logo.svg` (identical files, traced from the press kit icon); header/footer render it via CSS mask in `RoutLogo`. Why: the brand kit shape is canonical — never substitute a different tracing.
- Contact portal categories (general/business/partner/bug) seed the local triage; bug attachments upload anonymously via `/api/public/contact/attachment` into the internal bucket under `contact/`, validated by `src/lib/contact-attachments.ts` (extension + magic bytes, 5 MiB). Why: anonymous upload must stay narrow and content-sniffed.
- One identity, one main URL: the member's @ preference (`profiles.url_style`, binary via `urlStyleHasAt`/`urlStyleForAtPreference` in `src/lib/profile-url.ts`) decides the main shape; every other shape 301-redirects server-side via `rootRedirectFor`/`aliasRedirectFor` in the `$username` and `u.$username` loaders. Why: no two profile pages may ever exist for the same person. The Studio shows a single identity (verified profile when unlocked, else the privacy alias) — no side-by-side profile tabs.
