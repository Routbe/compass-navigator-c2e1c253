# Roadmap

- [x] Logo shape: header/footer now use the official brand-kit bunny (traced vector in public/logo.svg + src/assets/rout-logo.svg)
- [x] Studio crash hardening: workspace/block null-safety, useUrlStyle catch, identity-space storage guards, ErrorBoundary reset clears Cache Storage
- [x] Contact portal: 4 categories with dynamic fields + local triage seeding (DB columns added to Neon)
- [x] Bug attachments: /api/public/contact/attachment (5 MiB, png/jpg/txt/log/json, magic-byte sniffed)
- [x] Sitemap: added /contact, /press, /explore, /wifi-qr, /vcard-qr; 97 URLs, valid XML
- [x] SEO: Organization + SoftwareApplication JSON-LD on homepage, Article fallback JSON-LD + og:url for all MDX docs
- [x] Footer: 4 balanced columns (Platform / Infrastructure / Ecosystem / Support & Legal)
- [x] Verify: tsgo exit 0, 1415/1415 tests pass, browser check of contact/footer/sitemap/JSON-LD
- [x] Performance: duplicate-call check done — the two double fetches (health, showcase) are dev-only effect remounts of idempotent GETs, no production impact

## Sovereign OS refactor (Nov 2026)
- [x] Link Neon database connection
- [ ] `/` Omni-Bar gateway: smart parser (URL → Studio QR, @handle, commands), below-the-fold reveal
- [ ] Signed-in visitors on `/` redirected server-side to `/dashboard` (not on custom-domain profiles)
- [ ] `/dashboard` cockpit: bento widgets left + Chronos event stream right
- [ ] Old dashboard content moved to `/dashboard/assets`, `/dashboard/qr`, `/dashboard/links`
- [ ] `/dashboard/identity`: connected apps + primary-email change with per-app push selection
- [ ] `identity_relays` table (migration + schema)
- [ ] Local-first snapshot cache for dashboard state
- [ ] tsgo exit 0 + tests
