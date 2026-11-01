import { useEffect, useState } from "react";
import { ArrowRight, Fingerprint, LayoutDashboard, Loader2, QrCode, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { BrandLoader } from "@/components/BrandLoader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "@/lib/router-compat";
import { useAuth } from "@/hooks/useAuth";

const PILLARS = [
  {
    Icon: Fingerprint,
    title: "Eén geverifieerde identiteit",
    text: "Jouw handle, jouw regels. Geverifieerd, soeverein en gehost in de EU.",
  },
  {
    Icon: QrCode,
    title: "Dynamische routing",
    text: "QR-codes en korte links die je achteraf kunt bijsturen, zonder herdruk.",
  },
  {
    Icon: ShieldCheck,
    title: "Privacy by design",
    text: "Geen trackers, geen datahandel. Open source (AGPLv3) en zelf te hosten.",
  },
] as const;

/**
 * `/` — de Sovereign Gateway: introductie van het ecosysteem voor bezoekers.
 * Ingelogde leden gaan direct naar hun Command Center (/dashboard); de
 * werkplek voor creatie is /studio. Op gekoppelde eigen domeinen toont de
 * route zelf het hostprofiel (zie de route-component).
 */
export default function Gateway() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [quickUrl, setQuickUrl] = useState("");

  useEffect(() => {
    if (!loading && user) nav("/dashboard", { replace: true });
  }, [user, loading, nav]);

  const startQuickAction = () => {
    const value = quickUrl.trim();
    if (!value) return;
    nav(`/studio?mode=qr&url=${encodeURIComponent(value)}`);
  };

  if (loading || user) {
    return (
      <AppLayout title="ROUT">
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="relative h-24 w-24">
            <BrandLoader label="ROUT" />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="ROUT — Sovereign Digital Identity & Routing Infrastructure">
      <section className="mx-auto flex max-w-3xl flex-col items-center px-4 pb-16 pt-16 text-center sm:pt-24">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Sovereign Identity OS
        </p>
        <h1 className="mt-4 font-display text-4xl leading-tight text-foreground sm:text-6xl">
          Sovereign Digital Identity &amp; Routing Infrastructure
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          ROUT is een Europees, open-source besturingssysteem voor je digitale identiteit:
          één geverifieerd profiel, dynamische QR-codes en korte links — zonder trackers
          of datahandel.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg" className="gap-2 rounded-xl">
            <Link to="/studio">
              <Sparkles className="h-4 w-4" /> Open Studio (Creatie)
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="gap-2 rounded-xl">
            <Link to="/dashboard">
              <LayoutDashboard className="h-4 w-4" /> Open Dashboard (Beheer)
            </Link>
          </Button>
        </div>

        {/* Quick Action: plak een URL, druk op Enter en start direct de generator. */}
        <form
          className="mt-10 flex w-full max-w-xl items-center gap-2 rounded-2xl border border-border bg-card p-2"
          onSubmit={(e) => {
            e.preventDefault();
            startQuickAction();
          }}
        >
          <Zap className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          <Input
            value={quickUrl}
            onChange={(e) => setQuickUrl(e.target.value)}
            placeholder="Plak een URL en druk op Enter — wij maken er een QR van"
            className="h-11 flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0"
            inputMode="url"
            aria-label="Quick action: plak een URL"
          />
          <Button
            type="submit"
            size="sm"
            className="h-11 shrink-0 gap-1.5 rounded-xl"
            disabled={!quickUrl.trim()}
          >
            Start <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      </section>

      <section className="mx-auto grid max-w-5xl gap-4 px-4 pb-20 sm:grid-cols-3">
        {PILLARS.map(({ Icon, title, text }) => (
          <article key={title} className="rounded-2xl border border-border bg-card p-5">
            <Icon className="h-5 w-5 text-foreground" aria-hidden />
            <h2 className="mt-3 text-sm font-medium text-foreground">{title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{text}</p>
          </article>
        ))}
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-24">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link to="/explore" className="hover:text-foreground hover:underline underline-offset-4">
            Verken profielen
          </Link>
          <Link to="/product" className="hover:text-foreground hover:underline underline-offset-4">
            Platform
          </Link>
          <Link to="/developers" className="hover:text-foreground hover:underline underline-offset-4">
            Developers &amp; API
          </Link>
          <Link to="/about" className="hover:text-foreground hover:underline underline-offset-4">
            Over ROUT
          </Link>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Link to="/auth/sign-in" className="hover:text-foreground hover:underline underline-offset-4">
              Inloggen
            </Link>
          )}
        </div>
      </section>
    </AppLayout>
  );
}
