import { useTranslation } from "react-i18next";
import { BrandLoader } from "@/components/BrandLoader";
import { FirstUseTour } from "@/components/onboarding/FirstUseTour";
import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "@/lib/router-compat";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProfileEditor } from "@/components/dashboard/ProfileEditor";
import { BadgeCheck, Sparkles, HeartHandshake, ChevronDown, Check, CalendarClock } from "lucide-react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useAuth } from "@/hooks/useAuth";
import { useUrlStyle } from "@/hooks/useUrlStyle";
import { styledProfilePath, urlStyleForAtPreference, urlStyleHasAt } from "@/lib/profile-url";
import { getVerificationState } from "@/lib/verification.functions";
import { getWorkspaceContext } from "@/lib/workspaces.functions";
import { verifiedTabUnlocked } from "@/lib/studio-access";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { BookingStudioPanel } from "@/components/imported-pages/BookingStudio";

type PageMode = "profile" | "tip" | "booking";

/** /studio — the dedicated Profile Hub (link-in-bio) workspace. */
export default function Studio() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const nav = useNavigate();
  // Eén identiteit per lid: geverifieerde leden beheren hun geverifieerde
  // profiel, niet-geverifieerde leden hun privacy-alias. Geen dubbele tabs.
  const [pageMode, setPageMode] = useState<PageMode>("profile");
  // Uitkomst van de Snapchat-koppeling (?snapchat=…) zichtbaar maken.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const snap = params.get("snapchat");
    if (!snap) return;
    const msg: Record<string, [boolean, string]> = {
      connected: [true, "Snapchat is gekoppeld."],
      cancelled: [false, "Snapchat-koppeling geannuleerd."],
      not_configured: [false, "Snapchat is nog niet ingesteld door de beheerder."],
      invalid_state: [false, "Koppeling verlopen. Probeer het opnieuw."],
      in_use: [false, "Dit Snapchat-account is al aan een ander profiel gekoppeld."],
    };
    const [ok, text] = msg[snap] ?? [false, "Snapchat koppelen is mislukt. Probeer het opnieuw."];
    void import("sonner").then(({ toast }) => (ok ? toast.success(text) : toast.error(text)));
    params.delete("snapchat");
    const qs = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
  }, []);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("page") === "booking") setPageMode("booking");
  }, []);
  const [pages, setPages] = useState({ tipEnabled: false, handle: "" });
  const updatePages = useCallback((next: { tipEnabled: boolean; handle: string }) => setPages(next), []);
  const fetchState = useServerFn(getVerificationState);
  const state = useQuery({
    queryKey: ["verification-state", user?.id],
    queryFn: () => fetchState(),
    enabled: Boolean(user),
    retry: false,
  });
  const unlocked = verifiedTabUnlocked(state.data);
  const { style: urlStyle } = useUrlStyle();
  // In workspace mode Studio means the workspace's own Profile Hub, not this person's.
  const ctxFn = useServerFn(getWorkspaceContext);
  const wsCtx = useQuery({ queryKey: ["workspace-context"], queryFn: () => ctxFn(), enabled: Boolean(user), retry: false });
  const ctxData = wsCtx.data;
  const workspaceList = ctxData?.available && Array.isArray(ctxData.workspaces) ? ctxData.workspaces : [];
  const activeWorkspace = ctxData?.activeWorkspaceId
    ? workspaceList.find((w) => w && w.id === ctxData.activeWorkspaceId)
    : undefined;
  useEffect(() => {
    if (activeWorkspace) nav(`/studio/w/${encodeURIComponent(activeWorkspace.slug)}/hub`, { replace: true });
  }, [activeWorkspace, nav]);

  useEffect(() => {
    if (!loading && !user) nav("/auth/sign-in", { replace: true });
  }, [user, loading, nav]);

  const variant = unlocked ? ("verified" as const) : ("alias" as const);
  const primaryPath = pages.handle
    ? unlocked
      ? styledProfilePath(pages.handle, urlStyleForAtPreference(urlStyleHasAt(urlStyle)))
      : `/u/${pages.handle}`
    : null;

  const modeIcon = (m: PageMode, Fallback: typeof Sparkles) => m === "tip" ? HeartHandshake : m === "booking" ? CalendarClock : Fallback;
  const modeLabel = (m: PageMode, fallback: string) => m === "tip" ? t("studio.mode.tip") : m === "booking" ? t("studio.nav.booking") : fallback;
  const modeSuffix = (m: PageMode) => m === "tip" ? "/tip" : m === "booking" ? "/booking" : "";

  return (
    <AppLayout
      width="wide"
      title={t("studio.page.title")}
      description={t("studio.page.description")}
      crumbs={[{ label: "Studio" }]}
      trustBadges
    >
      {loading || !user || activeWorkspace || state.isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="relative h-24 w-24">
            <BrandLoader label={t("studio.studio.loading")} />
          </div>
        </div>
      ) : (
        <div className="relative flex flex-1 flex-col space-y-6 pb-8">
          <FirstUseTour area="studio" userId={user.id} />
          {/* Eén identiteit: de gekozen hoofd-URL, geen naast elkaar staande
              profielvarianten. */}
          <div data-tour="studio-pages" className="!mt-0 flex flex-nowrap gap-1 rounded-full bg-transparent p-0.5 pr-7 md:flex-wrap md:gap-2 md:p-1">
            {unlocked ? (
              <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" aria-label={t("studio.mode.pages")} className="h-9 min-w-0 flex-1 md:h-auto md:min-h-12 justify-start gap-2 whitespace-normal rounded-lg bg-foreground px-3 py-2 text-left text-background hover:bg-foreground hover:text-background">
                {(() => { const M = modeIcon(pageMode, BadgeCheck); return <M className="size-4 shrink-0" />; })()}<span className="min-w-0 flex-1"><span className="block text-sm font-medium">{modeLabel(pageMode, t("studio.profile.verified"))}</span><span className="hidden break-all font-mono text-xs opacity-70 md:block">rout.be{primaryPath ?? "/handle"}{modeSuffix(pageMode)}</span></span><ChevronDown className="size-4 shrink-0" />
              </Button></DropdownMenuTrigger><DropdownMenuContent align="start" className="w-72 max-w-[calc(100vw-24px)]">
                {(["profile", "tip", "booking"] as const).filter(mode => mode !== "tip" || pages.tipEnabled).map(mode => { const M = modeIcon(mode, BadgeCheck); return <DropdownMenuItem key={mode} onSelect={() => setPageMode(mode)}><M className="size-4" /><span className="flex-1">{modeLabel(mode, t("studio.mode.profile"))}</span>{pageMode === mode && <Check className="size-4" />}</DropdownMenuItem>; })}
              </DropdownMenuContent></DropdownMenu>
            ) : (
              <div className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-lg bg-foreground px-3 py-2 text-left text-background md:h-auto md:min-h-12">
                <Sparkles className="size-4 shrink-0" />
                <span className="min-w-0 flex-1"><span className="block text-sm font-medium">{t("studio.profile.alias")}</span><span className="hidden break-all font-mono text-xs opacity-70 md:block">{primaryPath ? `rout.be${primaryPath}` : "rout.be/u/handle"}</span></span>
              </div>
            )}
          </div>
          <ErrorBoundary label={t("studio.page.title")} inline>
            {pageMode === "booking" && unlocked && <BookingStudioPanel />}
            <div hidden={pageMode === "booking" && unlocked}>
              <ProfileEditor key={variant} variant={variant} pageMode={pageMode === "tip" && unlocked ? "tip" : "profile"} onPagesChange={updatePages} />
            </div>
          </ErrorBoundary>
        </div>
      )}
    </AppLayout>
  );
}

