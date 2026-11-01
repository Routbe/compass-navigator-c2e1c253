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
- [x] Account merge (0150–0152 + 0158 applied): relays move to the primary, same-app duplicates archived with a warning
- [x] Identity relays are the primary model: relay registry kept in lockstep with forwarding rules, targets self-heal on email change, push protocol is the fallback
- [x] Local-first outbox for relay pause/resume (0 ms UI, persisted queue, background flush)
- [x] Obsidian gateway with ecosystem section (Login met ROUT, Workspaces, API); custom-domain profile lazy-loaded out of the gateway bundle
- [x] Cockpit without QR statistics (moved to /dashboard/assets); Chronos stream adds hub contact messages and relay mail
- [x] rout_app least privilege (0158) verified live: read/write OK; truncate/create/drop/alter/temp refused
- [x] GEO: Organization + Person (founder) + SoftwareApplication (ROUT OS, AGPLv3) + SoftwareSourceCode in the head of /
- [ ] Switch the Neon connection login from the owner to rout_app — the linked Neon connection still logs in as neondb_owner (checked 2 Nov); every app request already steps down to rout_app

## Approval & GEO (Nov 2026)
- [x] North star updated to the founder's wording
- [x] 0153, 0155, 0156 applied; 96, 0149, 0154 registered (already live); nothing pending
- [x] Sitewide knowledge graph in __root (Organization, founder, ROUT OS, source code), keywords meta
- [x] Title convention `PageName | ROUT - Sovereign Digital Identity OS` on every ROUT page
- [x] "What is ROUT?" section on /manifesto (4 languages)

## Trust, age gating & go-live (Nov 2026)
- [ ] North star metric → Login met ROUT bij externe apps per week
- [ ] Neon connection login: check whether it is rout_app
- [ ] Sign-up: required terms/privacy/16+ checkbox; implicit notice above social buttons
- [ ] Remove birth-date fields (vCard block, verification requirement, birthdate dialog); drop user_birthdates after confirmation
- [ ] user_verified_claims table (rout_app least privilege) + Sovereign Trust widget on /dashboard/identity
- [ ] OIDC scopes verify_human / verify_18_plus prepared (boolean claims)
- [ ] Final check: tsgo, tests, dead links / missing imports on critical paths, production readiness
