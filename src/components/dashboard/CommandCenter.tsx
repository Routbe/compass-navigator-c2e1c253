import { useState, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowRight,
  ArrowUpRight,
  AtSign,
  BarChart3,
  CalendarDays,
  Fingerprint,
  Inbox,
  KeyRound,
  LayoutTemplate,
  Loader2,
  MessageCircleQuestion,
  Megaphone,
  QrCode,
  RefreshCw,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { BrandLoader } from "@/components/BrandLoader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "@/lib/router-compat";
import { useAuth } from "@/hooks/useAuth";
import { getDashboardOverview } from "@/lib/dashboard.functions";
import { getCommandCenter, type ChronosEvent, type ChronosKind, type CommandCenterData } from "@/lib/command-center.functions";
import { useLocalFirst } from "@/lib/local-first/useLocalFirst";
import { parseOmniInput } from "@/lib/omni-parser";
import { cn } from "@/lib/utils";

interface Overview {
  saved: number;
  tracked: number;
  scans: number;
  trend: number[];
}

interface CockpitState {
  overview: Overview | null;
  center: CommandCenterData | null;
}

const KIND_ICON: Record<ChronosKind, typeof Inbox> = {
  notification: Inbox,
  question: MessageCircleQuestion,
  guestbook: Megaphone,
  login: KeyRound,
  booking: CalendarDays,
};

const EXAMPLE_EVENTS: ChronosEvent[] = [
  { id: "ex-1", kind: "guestbook", title: "Nieuwe prikbord-aanvraag ontvangen", detail: "Verschijnt hier zodra iemand op je prikbord schrijft.", at: "" },
  { id: "ex-2", kind: "question", title: "Anonieme Q&A binnengekomen", detail: "Vragen via je profielhub komen hier binnen.", at: "" },
  { id: "ex-3", kind: "login", title: "Nieuwe login gedetecteerd bij App X", detail: "Elke “Login met ROUT” wordt hier gelogd.", at: "" },
];

const rtf = new Intl.RelativeTimeFormat("nl-BE", { numeric: "auto" });
function relative(at: string): string {
  if (!at) return "Voorbeeld";
  const diff = (new Date(at).getTime() - Date.now()) / 1000;
  const abs = Math.abs(diff);
  if (abs < 60) return rtf.format(Math.round(diff), "second");
  if (abs < 3600) return rtf.format(Math.round(diff / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), "hour");
  return rtf.format(Math.round(diff / 86400), "day");
}

const fmt = (n: number | null | undefined) => (n == null ? "—" : String(n));

function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(1, ...data);
  return (
    <div className="flex h-14 items-end gap-1" role="img" aria-label="Scans van de laatste 14 dagen">
      {data.map((v, i) => (
        <span key={i} className="flex-1 rounded-sm bg-accent" style={{ height: `${Math.max(6, (v / max) * 100)}%` }} />
      ))}
    </div>
  );
}

function Widget({
  to,
  icon: Icon,
  eyebrow,
  title,
  hint,
  className,
  children,
}: {
  to?: string;
  icon: typeof Inbox;
  eyebrow: string;
  title: ReactNode;
  hint?: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          <Icon className="h-3.5 w-3.5" aria-hidden /> {eyebrow}
        </span>
        {to ? <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden /> : null}
      </div>
      <div className="mt-4 font-display text-2xl leading-tight text-foreground sm:text-[28px]">{title}</div>
      {hint ? <p className="mt-1.5 text-sm text-muted-foreground">{hint}</p> : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </>
  );
  const cls = cn(
    "group flex min-w-0 flex-col rounded-2xl border border-border bg-card p-5 transition-colors",
    to && "hover:border-border-ink",
    className,
  );
  return to ? (
    <Link to={to} className={cls}>
      {body}
    </Link>
  ) : (
    <section className={cls}>{body}</section>
  );
}

function QuickQr() {
  const nav = useNavigate();
  const [value, setValue] = useState("");
  const intent = parseOmniInput(value);
  return (
    <form
      className="flex items-center gap-2 rounded-xl border border-border bg-background p-1.5"
      onSubmit={(e) => {
        e.preventDefault();
        if (intent.kind === "url") nav(intent.destination);
      }}
    >
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="https://…"
        inputMode="url"
        aria-label="URL voor een snelle QR-code"
        className="h-9 min-w-0 flex-1 bg-transparent px-2 font-mono text-sm outline-none placeholder:text-muted-foreground"
      />
      <Button type="submit" size="sm" className="h-9 shrink-0 rounded-lg" disabled={intent.kind !== "url"}>
        <ArrowRight className="h-4 w-4" />
        <span className="sr-only">QR maken</span>
      </Button>
    </form>
  );
}

function ChronosStream({ events, syncing }: { events: ChronosEvent[]; syncing: boolean }) {
  const shown = events.length ? events : EXAMPLE_EVENTS;
  return (
    <aside className="min-w-0 rounded-2xl border border-border bg-card p-5 lg:sticky lg:top-20" aria-label="Chronos Stream">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Chronos Stream</h2>
        {syncing ? <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" aria-label="Synchroniseren" /> : null}
      </div>
      {!events.length ? (
        <p className="mt-2 text-xs text-muted-foreground">Nog geen gebeurtenissen — zo ziet je tijdlijn eruit.</p>
      ) : null}
      <ol className="relative mt-5 space-y-5 border-l border-border pl-5">
        {shown.map((ev) => {
          const Icon = KIND_ICON[ev.kind];
          return (
            <li key={ev.id} className="relative">
              <span className="absolute -left-[31px] top-0 grid h-5 w-5 place-items-center rounded-full border border-border bg-background">
                <Icon className="h-3 w-3 text-foreground" aria-hidden />
              </span>
              <div className="flex items-baseline justify-between gap-3">
                <p className="min-w-0 text-sm font-medium text-foreground">{ev.title}</p>
                {ev.at ? (
                  <time dateTime={ev.at} className="shrink-0 text-[11px] text-muted-foreground">
                    {relative(ev.at)}
                  </time>
                ) : (
                  <Badge variant="outline" className="shrink-0 text-[10px] font-normal">
                    Voorbeeld
                  </Badge>
                )}
              </div>
              {ev.detail ? <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{ev.detail}</p> : null}
            </li>
          );
        })}
      </ol>
    </aside>
  );
}

/**
 * /dashboard — the Command Center cockpit. Left: bento control grid; right:
 * the Chronos event stream. State is local-first: the last snapshot paints
 * instantly from IndexedDB and is revalidated in the background.
 */
export function CommandCenter() {
  const { user } = useAuth();
  const loadOverview = useServerFn(getDashboardOverview);
  const loadCenter = useServerFn(getCommandCenter);
  const state = useLocalFirst<CockpitState>(user ? `cockpit:${user.id}` : null, async () => {
    const [overview, center] = await Promise.all([
      loadOverview().catch(() => null),
      loadCenter().catch(() => null),
    ]);
    return { overview, center };
  });

  if (!user || (!state.data && state.syncing)) {
    return (
      <AppLayout title="Command Center" width="wide">
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="relative h-24 w-24">
            <BrandLoader label="Cockpit laden…" />
          </div>
        </div>
      </AppLayout>
    );
  }

  const o = state.data?.overview ?? null;
  const c = state.data?.center ?? null;
  const inboxCount = c ? (c.unreadNotifications ?? 0) + (c.openQuestions ?? 0) : null;
  const trend = o?.trend ?? [];

  return (
    <AppLayout
      title="Command Center"
      description="Je soevereine cockpit voor identiteit, communicatie en routing."
      width="wide"
      crumbs={[{ label: "Command Center" }]}
      actions={
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="ghost" className="gap-1.5" onClick={() => void state.refresh()} disabled={state.syncing}>
            <RefreshCw className={cn("h-4 w-4", state.syncing && "animate-spin")} /> Sync
          </Button>
          <Button asChild size="sm" variant="outline" className="gap-1.5">
            <Link to="/dashboard/assets">
              <BarChart3 className="h-4 w-4" /> Assets
            </Link>
          </Button>
          <Button asChild size="sm" className="gap-1.5">
            <Link to="/studio">
              <LayoutTemplate className="h-4 w-4" /> Studio
            </Link>
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid auto-rows-min gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Widget
            to="/dashboard/assets"
            icon={BarChart3}
            eyebrow="Quick Stats"
            title={`${fmt(o?.scans)} scans`}
            hint={`${fmt(o?.tracked)} dynamische links · ${fmt(o?.saved)} opgeslagen QR's`}
            className="sm:col-span-2"
          >
            {trend.some((v) => v > 0) ? (
              <Sparkline data={trend} />
            ) : (
              <p className="text-xs text-muted-foreground">Nog geen scans in de laatste 14 dagen.</p>
            )}
          </Widget>

          <Widget
            to="/dashboard/identity"
            icon={Fingerprint}
            eyebrow="Identity Relays"
            title={`${fmt(c?.connectedApps)} gekoppelde apps`}
            hint={`${fmt(c?.activeRelays)} actieve privé-relays · beheer apps & e-mail aliassen`}
          />

          <Widget
            to="/dashboard/assets"
            icon={Inbox}
            eyebrow="Unified Inbox"
            title={`${fmt(inboxCount)} nieuwe berichten & Q&A's`}
            hint={`${fmt(c?.unreadNotifications)} meldingen · ${fmt(c?.openQuestions)} open vragen`}
          />

          <Widget
            to="/studio/booking"
            icon={CalendarDays}
            eyebrow="Agenda & Boekingen"
            title={c?.upcomingBookings ? `${c.upcomingBookings} aankomend` : "Geen aankomende afspraken"}
            hint={c?.nextBookingAt ? `Volgende: ${new Date(c.nextBookingAt).toLocaleString("nl-BE")}` : "Deel je boekingspagina vanuit de Studio."}
          />

          <Widget
            to="/dashboard/bluesky"
            icon={AtSign}
            eyebrow="Social & Prikbord"
            title={`${fmt(c?.guestbook30d)} prikbord-berichten`}
            hint="Beheer je Mastodon/Bluesky feed op je hub (laatste 30 dagen)."
          />

          <Widget to="/studio" icon={LayoutTemplate} eyebrow="Profiel Hub" title="Hub beheren" hint="Blokken, thema en zichtbaarheid in de Studio." />

          <Widget icon={QrCode} eyebrow="Quick QR" title="Plak een link" className="sm:col-span-2 xl:col-span-1">
            <QuickQr />
          </Widget>
        </div>

        <ChronosStream events={c?.events ?? []} syncing={state.syncing} />
      </div>
      {state.savedAt ? (
        <p className="mt-4 text-right text-[11px] text-muted-foreground">
          Lokaal gesynchroniseerd {relative(new Date(state.savedAt).toISOString())}
        </p>
      ) : null}
    </AppLayout>
  );
}
