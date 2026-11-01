import { pageCardImage } from "@/lib/page-cards";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { getGatewaySession } from "@/lib/gateway.functions";
import Page from "@/components/imported-pages/Gateway";
import { getRequestLocale } from "@/lib/locale.functions";
import { resolveHostProfile } from "@/lib/domain-routing.functions";
import { OG_IMAGE, canonicalLinks, jsonLdScript, socialMeta } from "@/lib/social-meta";
import { getPublicProfileByHandle } from "@/lib/studio-profile.functions";
import { fediverseHeadLinks, type FediverseIdentity } from "@/lib/fediverse-profile";
import { profileSocialMeta } from "@/lib/social-meta";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [locale, host] = await Promise.all([
      getRequestLocale().catch(() => ({ locale: "en" as const })),
      resolveHostProfile().catch(() => ({ handle: null as string | null })),
    ]);
    // Gateway sluice: a signed-in member's root is the cockpit (never on a member's own domain).
    if (!host.handle) {
      const session = await getGatewaySession().catch(() => ({ signedIn: false }));
      if (session.signedIn) throw redirect({ to: "/dashboard", replace: true });
    }
    const hostProfile = host.handle ? await getPublicProfileByHandle({ data: { handle: host.handle } }).catch(() => null) : null;
    return { ...locale, hostHandle: host.handle, hostProfile };
  },
  head: ({ loaderData }) => ({
    meta: loaderData?.hostProfile ? profileSocialMeta({ locale: loaderData.locale, handle: loaderData.hostHandle ?? "", displayName: loaderData.hostProfile["display_name"] as string | null, bio: loaderData.hostProfile["bio"] as string | null, avatarUrl: loaderData.hostProfile["avatar_url"] as string | null, url: "/" }) : socialMeta(loaderData?.locale ?? "en", pageCardImage("home", loaderData?.locale ?? "en")),
    links: [...canonicalLinks("/"), ...fediverseHeadLinks(loaderData?.hostProfile?.["fediverse"] as FediverseIdentity | null)],
    scripts: jsonLdScript({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "@id": "https://rout.be/#website",
          name: "ROUT",
          url: "https://rout.be",
          inLanguage: loaderData?.locale ?? "en",
          publisher: { "@id": "https://rout.be/#org" },
        },
        {
          "@type": "Organization",
          "@id": "https://rout.be/#org",
          name: "ROUT",
          url: "https://rout.be",
          logo: "https://rout.be/img/logo.png",
          description:
            "European, sovereign and open-source (AGPLv3) digital identity and routing infrastructure: verified identity, Login with ROUT (OpenID Connect), privacy email relays, dynamic QR codes and short links.",
          founder: { "@id": "https://rout.be/#founder" },
          foundingLocation: { "@type": "Place", address: { "@type": "PostalAddress", addressRegion: "Europe" } },
          sameAs: ["https://github.com/routbe", "https://bsky.app/profile/rout.be", "https://mastodon.social/@routbe"],
        },
        {
          "@type": "Person",
          "@id": "https://rout.be/#founder",
          name: "Jona Zeno Delplanche",
          url: "https://delplanche.cloud",
          worksFor: { "@id": "https://rout.be/#org" },
        },
        {
          "@type": "SoftwareApplication",
          "@id": "https://rout.be/#app",
          name: "ROUT OS",
          alternateName: "ROUT",
          url: "https://rout.be",
          description:
            "Sovereign Digital Identity & Routing Infrastructure: one verified identity, Login with ROUT for third-party apps, private email relays, workspaces, an open API, dynamic QR codes and short links — hosted in the EU, without trackers.",
          applicationCategory: "DeveloperApplication",
          applicationSubCategory: "Digital identity & routing infrastructure",
          operatingSystem: "Web",
          inLanguage: ["nl", "en", "fr", "de"],
          license: "https://www.gnu.org/licenses/agpl-3.0.html",
          isAccessibleForFree: true,
          featureList: [
            "Verified sovereign digital identity",
            "Login with ROUT (OpenID Connect provider)",
            "Private email relays per connected app",
            "Workspaces with team roles",
            "Open API and developer console",
            "Dynamic QR codes and short links with cookieless analytics",
          ],
          offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
          author: { "@id": "https://rout.be/#founder" },
          creator: { "@id": "https://rout.be/#founder" },
          publisher: { "@id": "https://rout.be/#org" },
        },
        {
          "@type": "SoftwareSourceCode",
          "@id": "https://rout.be/#source",
          name: "ROUT OS source code",
          codeRepository: "https://github.com/routbe",
          license: "https://www.gnu.org/licenses/agpl-3.0.html",
          programmingLanguage: "TypeScript",
          author: { "@id": "https://rout.be/#founder" },
          targetProduct: { "@id": "https://rout.be/#app" },
        },
      ],
    }),
  }),
  component: HomeRoute,
});

// Custom-domain profiles only: kept out of the marketing gateway bundle.
const HostProfile = lazy(() => import("@/components/imported-pages/HostProfile").then((m) => ({ default: m.HostProfile })));

/** Op een gekoppeld eigen domein toont "/" het profiel van die eigenaar. */
function HomeRoute() {
  const { hostHandle } = Route.useLoaderData();
  if (hostHandle) {
    return (
      <Suspense fallback={null}>
        <HostProfile handle={hostHandle} />
      </Suspense>
    );
  }
  return <Page />;
}

