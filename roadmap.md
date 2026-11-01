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
- [x] `/` Omni-Bar gateway: smart parser (URL → Studio QR, @handle, commands), below-the-fold reveal
- [x] Signed-in visitors on `/` redirected server-side to `/dashboard` (not on custom-domain profiles)
- [x] `/dashboard` cockpit: bento widgets left + Chronos event stream right
- [x] Old dashboard content moved to `/dashboard/assets`, `/dashboard/qr`, `/dashboard/links`
- [x] `/dashboard/identity`: connected apps + primary-email change with per-app push selection
- [x] `identity_relays` table (migration + schema)
- [x] Local-first snapshot cache for dashboard state
- [x] tsgo exit 0 + tests
- [x] Short-link resolver: isolate edge cache (15 s) with a KV-ready store interface
- [ ] Account-merge SQL function (db/0152, still pending review) does not move identity_relays yet — needs regeneration when 0152 is applied
- [x] Identity relays are the primary model: relay registry kept in lockstep with forwarding rules, targets self-heal on email change, push protocol is the fallback
- [x] Local-first outbox for relay pause/resume (0 ms UI, persisted queue, background flush)
- [x] Obsidian gateway with ecosystem section (Login met ROUT, Workspaces, API); custom-domain profile lazy-loaded out of the gateway bundle
- [x] Cockpit without QR statistics (moved to /dashboard/assets); Chronos stream adds hub contact messages and relay mail
