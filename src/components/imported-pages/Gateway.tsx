import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowRight,
  AtSign,
  CornerDownLeft,
  Fingerprint,
  LayoutDashboard,
  QrCode,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "@/lib/router-compat";
import { useAuth } from "@/hooks/useAuth";
import { useReveal } from "@/hooks/useReveal";
import { parseOmniInput, type OmniIntent } from "@/lib/omni-parser";
import { cn } from "@/lib/utils";

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

const SUGGESTIONS = ["https://", "@handle", "/studio", "/dashboard"] as const;

function hintFor(intent: OmniIntent): { icon: ReactNode; text: string } {
  switch (intent.kind) {
    case "url":
      return { icon: <QrCode className="h-3.5 w-3.5" />, text: `QR-code maken voor ${new URL(intent.url).host}` };
    case "handle":
      return { icon: <AtSign className="h-3.5 w-3.5" />, text: `Profiel openen: @${intent.handle}` };
    case "command":
      return { icon: <TerminalSquare className="h-3.5 w-3.5" />, text: `Commando: ${intent.command}` };
    case "unknown":
      return { icon: <TerminalSquare className="h-3.5 w-3.5" />, text: "Probeer een URL, een @handle of een commando zoals /dashboard" };
    default:
      return { icon: <CornerDownLeft className="h-3.5 w-3.5" />, text: "Druk op Enter om te routeren" };
  }
}

function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} data-visible={visible ? "true" : "false"} className={cn("omni-reveal", className)}>
      {children}
    </div>
  );
}

/**
 * `/` — de Sovereign Omni-Bar. Eén invoerveld routeert alles: een URL opent de
 * QR-generator in /studio, een @handle het profiel, een commando de juiste
 * module. Ingelogde leden worden al server-side naar /dashboard gestuurd (zie
 * de route-loader); dit effect vangt enkel client-side aanmeldingen op.
 */
export default function Gateway() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [value, setValue] = useState("");
  const intent = useMemo(() => parseOmniInput(value), [value]);
  const hint = hintFor(intent);

  useEffect(() => {
    if (!loading && user) nav("/dashboard", { replace: true });
  }, [user, loading, nav]);

  const submit = () => {
    if (intent.kind === "url" || intent.kind === "handle" || intent.kind === "command") {
      nav(intent.destination);
    }
  };

  return (
    <AppLayout width="full" revealFooter>
      <section className="dark omni-stage bg-background text-foreground">
        <div className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Sovereign Digital Node</p>
          <h1 className="mt-5 font-display text-4xl leading-[1.05] sm:text-6xl">Wat wil je routeren?</h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
            Sovereign Digital Identity &amp; Routing Infrastructure — Europees, open source, zonder trackers.
          </p>

          <form
            className="omni-bar mt-10 w-full"
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <label htmlFor="omni-input" className="sr-only">
              Voer een URL, commando of @handle in
            </label>
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-paper-xl focus-within:border-ring">
              <TerminalSquare className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
              <input
                id="omni-input"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Voer een URL, commando of @handle in"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                enterKeyHint="go"
                className="h-12 min-w-0 flex-1 bg-transparent font-mono text-base text-foreground outline-none placeholder:text-muted-foreground sm:text-lg"
              />
              <Button
                type="submit"
                size="icon"
                className="h-11 w-11 shrink-0 rounded-xl"
                disabled={intent.kind === "empty" || intent.kind === "unknown"}
                aria-label="Routeren"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-3 flex min-h-5 items-center justify-center gap-1.5 text-xs text-muted-foreground" aria-live="polite">
              {hint.icon}
              {hint.text}
            </p>
          </form>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setValue(s === "@handle" ? "@" : s);
                  document.getElementById("omni-input")?.focus();
                }}
                className="rounded-full border border-border px-3 py-1 font-mono text-xs text-muted-foreground transition-colors hover:border-ring hover:text-foreground"
              >
                {s}
              </button>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
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
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Het ecosysteem</p>
          <h2 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
            Eén soeverein besturingssysteem voor identiteit, communicatie en routing
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Creëer in de Studio, beheer in je Command Center en koppel apps via “Login met ROUT” — alles op één
            domein, met je gegevens in Europa.
          </p>
        </Reveal>

        <Reveal className="mt-12 grid gap-4 sm:grid-cols-3">
          {PILLARS.map(({ Icon, title, text }) => (
            <article key={title} className="rounded-2xl border border-border bg-card p-5">
              <Icon className="h-5 w-5 text-foreground" aria-hidden />
              <h3 className="mt-3 text-sm font-medium text-foreground">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{text}</p>
            </article>
          ))}
        </Reveal>

        <Reveal className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link to="/explore" className="underline-offset-4 hover:text-foreground hover:underline">
            Verken profielen
          </Link>
          <Link to="/product" className="underline-offset-4 hover:text-foreground hover:underline">
            Platform
          </Link>
          <Link to="/developers" className="underline-offset-4 hover:text-foreground hover:underline">
            Developers &amp; API
          </Link>
          <Link to="/about" className="underline-offset-4 hover:text-foreground hover:underline">
            Over ROUT
          </Link>
          <Link to="/auth/sign-in" className="underline-offset-4 hover:text-foreground hover:underline">
            Inloggen
          </Link>
        </Reveal>
      </div>
    </AppLayout>
  );
}
