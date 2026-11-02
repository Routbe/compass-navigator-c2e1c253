import { createServerFn } from "@tanstack/react-start";
import { requireAuth } from "@/lib/auth/middleware";
import {
  parsePatch,
  profileLinksPatchSchema,
  profileMetaPatchSchema,
  profileThemePatchSchema,
} from "./profile-draft-patch";
import { normalizeLayersPref } from "./profile-display";
import { normalizeQrSettings } from "./qr-settings";

/**
 * Atomic Studio mutations, one per section. Each validates only its own
 * fields and writes to the canvas named by `space`, so the verified profile
 * and the private alias can never overwrite each other.
 */

async function invalid(reason: string) {
  const { classifySaveError } = await import("./save-errors");
  return { ok: false as const, meta: null, error: classifySaveError(reason) };
}

function workspaceOf(context: unknown): string | null {
  return (context as { activeWorkspaceId?: string | null }).activeWorkspaceId ?? null;
}

export const updateProfileMeta = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .inputValidator((input: unknown) => parsePatch(profileMetaPatchSchema, input))
  .handler(async ({ data, context }) => {
    if ("__invalid" in data) return invalid(data.__invalid);
    const { space, ...fields } = data;
    const { runDraftPatch } = await import("./draft-save.server");
    return runDraftPatch(context.userId, workspaceOf(context), space, { fields }, "updateProfileMeta");
  });

export const updateProfileTheme = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .inputValidator((input: unknown) => parsePatch(profileThemePatchSchema, input))
  .handler(async ({ data, context }) => {
    if ("__invalid" in data) return invalid(data.__invalid);
    const { space, prefs, dropPrefs, ...fields } = data;
    // Strict server-side defaults for structured prefs (never trust the client):
    // an empty or invalid QR style is removed so the renderer uses the ROUT default.
    const safePrefs: Record<string, unknown> = { ...prefs };
    const drops = [...dropPrefs];
    if ("qrSettings" in safePrefs) {
      const qr = normalizeQrSettings(safePrefs["qrSettings"]);
      if (qr) safePrefs["qrSettings"] = JSON.parse(JSON.stringify(qr));
      else {
        delete safePrefs["qrSettings"];
        drops.push("qrSettings");
      }
    }
    if ("designLayers" in safePrefs) safePrefs["designLayers"] = normalizeLayersPref(safePrefs["designLayers"]);
    const { runDraftPatch } = await import("./draft-save.server");
    return runDraftPatch(
      context.userId,
      workspaceOf(context),
      space,
      { fields, prefs: safePrefs, dropPrefs: drops },
      "updateProfileTheme",
    );
  });

export const updateProfileLinks = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .inputValidator((input: unknown) => parsePatch(profileLinksPatchSchema, input))
  .handler(async ({ data, context }) => {
    if ("__invalid" in data) return invalid(data.__invalid);
    const { runDraftPatch } = await import("./draft-save.server");
    return runDraftPatch(context.userId, workspaceOf(context), data.space, { fields: { blocks: data.blocks } }, "updateProfileLinks");
  });
