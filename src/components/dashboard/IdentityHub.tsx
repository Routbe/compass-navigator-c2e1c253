import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Mail, Send, Webhook } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout/AppLayout";
import { ConnectedAppsPanel } from "@/components/settings/ConnectedAppsPanel";
import { withStepUp } from "@/components/auth/StepUpDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { startPrimaryEmailChange } from "@/lib/auth/email-safety.functions";
import { bulkUpdateAppEmails, listAppEmails, listConnectedApps } from "@/lib/oauth/connected-apps.functions";
import { isPushable, pushableIds, toggleAll, togglePick } from "@/lib/identity-push";

/**
 * /dashboard/identity — Identity & Email Push Engine.
 * 1. Change the primary address (verified by mail, step-up protected).
 * 2. Pick the connected apps that receive it via the ROUT Push Protocol: a
 *    signed `email.updated` webhook to each app's back-channel.
 */
export function IdentityHub() {
  const qc = useQueryClient();
  const listApps = useServerFn(listConnectedApps);
  const listEmails = useServerFn(listAppEmails);
  const startChange = useServerFn(startPrimaryEmailChange);
  const push = useServerFn(bulkUpdateAppEmails);
  const apps = useQuery({ queryKey: ["connected-apps"], queryFn: () => listApps() });
  const mail = useQuery({ queryKey: ["connected-app-emails"], queryFn: () => listEmails() });
  const [email, setEmail] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [busy, setBusy] = useState<"email" | "push" | null>(null);

  const rows = (apps.data ?? []).map((a) => {
    const em = mail.data?.apps.find((m) => m.clientId === a.clientId);
    return { ...a, choiceId: em?.choiceId ?? "primary", assignedEmail: em?.assignedEmail ?? null };
  });
  const stale = mail.data?.stale ?? [];
  const selectable = pushableIds(rows);
  const allPicked = selectable.length > 0 && selectable.every((id) => picked.includes(id));

  async function onChangeEmail() {
    setBusy("email");
    try {
      await withStepUp(() => startChange({ data: { email } }));
      toast.success("Bevestigingsmail verstuurd. Na bevestiging push je het nieuwe adres naar je apps.");
      setEmail("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Wijziging geblokkeerd.");
    } finally {
      setBusy(null);
    }
  }

  async function onPush() {
    setBusy("push");
    try {
      const r = await withStepUp(() => push({ data: { clientIds: picked } }));
      toast.success(r.updated ? `${r.updated} app(s) ontvangen ${mail.data?.primary ?? "je adres"}.` : "Alle gekozen apps waren al up-to-date.");
      setPicked([]);
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["connected-apps"] }),
        qc.invalidateQueries({ queryKey: ["connected-app-emails"] }),
      ]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Push mislukt.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <AppLayout
      title="Identity & Connected Apps"
      description="Eén identiteit, jouw regels: beheer wie je e-mailadres krijgt."
      crumbs={[{ label: "Command Center", to: "/dashboard" }, { label: "Identity" }]}
    >
      <div className="space-y-4">
        <section className="space-y-3 rounded-2xl border border-border bg-card p-4 sm:p-5">
          <h2 className="flex items-center gap-2 text-lg font-medium">
            <Mail className="h-4 w-4" /> Primair e-mailadres
          </h2>
          <p className="text-sm text-muted-foreground">
            Huidig: <span className="font-medium text-foreground">{mail.data?.primary ?? "—"}</span>. Je nieuwe adres wordt pas actief na
            bevestiging; je oude adres blijft 48 uur beschikbaar voor noodherstel.
          </p>
          <form
            className="flex flex-col gap-2 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              void onChangeEmail();
            }}
          >
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nieuw@adres.be"
              autoComplete="email"
              aria-label="Nieuw primair e-mailadres"
              className="h-11 rounded-xl"
            />
            <Button type="submit" className="h-11 shrink-0" disabled={!email || busy === "email"}>
              {busy === "email" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Adres wijzigen"}
            </Button>
          </form>
        </section>

        <section className="space-y-3 rounded-2xl border border-border bg-card p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-lg font-medium">
              <Webhook className="h-4 w-4" /> ROUT Push Protocol
            </h2>
            {selectable.length > 0 ? (
              <Button variant="outline" size="sm" onClick={() => setPicked(toggleAll(rows, picked))}>
                {allPicked ? "Deselecteer alles" : "Selecteer alles"}
              </Button>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">
            Kies welke gekoppelde apps je primaire adres ({mail.data?.primary ?? "—"}) krijgen. Elke app ontvangt een ondertekende
            <code className="mx-1 rounded bg-muted px-1 py-0.5 font-mono text-xs">email.updated</code>webhook. Apps met een privé-relay
            houden hun relay-adres.
          </p>

          {apps.isLoading || mail.isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : !rows.length ? (
            <p className="rounded-xl bg-muted/40 p-4 text-sm text-muted-foreground">
              Nog geen apps gekoppeld via “Login met ROUT”.
            </p>
          ) : (
            <ul className="divide-y divide-border rounded-xl border border-border">
              {rows.map((app) => {
                const disabled = !isPushable(app);
                return (
                  <li key={app.clientId}>
                    <label className={`flex items-center gap-3 p-3 ${disabled ? "opacity-60" : "cursor-pointer"}`}>
                      <Checkbox
                        checked={picked.includes(app.clientId)}
                        disabled={disabled}
                        onCheckedChange={() => setPicked((p) => togglePick(rows, p, app.clientId))}
                        aria-label={`Push naar ${app.name}`}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{app.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">{app.assignedEmail ?? "Nog geen adres gedeeld"}</span>
                      </span>
                      {disabled ? (
                        <Badge variant="outline" className="text-xs font-normal">privé-relay</Badge>
                      ) : stale.includes(app.clientId) ? (
                        <Badge variant="secondary" className="text-xs">oud adres</Badge>
                      ) : null}
                    </label>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="flex justify-end">
            <Button onClick={() => void onPush()} disabled={!picked.length || busy === "push"} className="gap-2">
              {busy === "push" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Push naar {picked.length} app{picked.length === 1 ? "" : "s"}
            </Button>
          </div>
        </section>

        <ConnectedAppsPanel autoWizard={false} />
      </div>
    </AppLayout>
  );
}
