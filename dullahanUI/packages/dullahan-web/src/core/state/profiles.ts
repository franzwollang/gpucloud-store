/**
 * Slice profiles: named presets bundling the four state axes
 * (scope, tier, transport, persistence policy). Profiles are DX sugar —
 * the underlying axes remain inspectable on every slice's metadata and
 * any field can be overridden at definition time.
 */

export type StateScope = "serverOnly" | "shared" | "clientOnly" | "global";

/**
 * Trust tier:
 * - `committed`  — server-finalized; small; eligible for versioned persistence
 * - `cache`      — server truth cached client-side (TanStack Query); never in a slice
 * - `projection` — client-local, ephemeral or best-effort persisted; no server role
 */
export type StateTier = "committed" | "cache" | "projection";

export type StateTransport = "json" | "rsc" | "none";

export type PersistTarget = "localStorage" | "sessionStorage" | "cookie";

export type SliceProfileSpec = {
	scope: StateScope;
	tier: StateTier;
	transport: StateTransport;
	/** Whether slices with this profile persist by default. */
	persist: boolean;
	persistTarget?: PersistTarget;
	/**
	 * Reserved for optional future tamper-evident signing of persisted documents.
	 * Not implemented — Zod validation + versioned persist is the default integrity model.
	 */
	hmac: boolean;
	/** Soft byte budget for the persisted document; exceeded → dev warning. */
	maxPersistedBytes?: number;
};

export const SLICE_PROFILES = {
	/** Auth hints, roles, entitlements. Server session only; never client-persisted. */
	"security-sensitive": {
		scope: "serverOnly",
		tier: "committed",
		transport: "none",
		persist: false,
		hmac: false
	},
	/** Theme, locale, consent — small durable prefs, Zod-validated on rehydrate. */
	"global-prefs": {
		scope: "global",
		tier: "committed",
		transport: "json",
		persist: true,
		persistTarget: "localStorage",
		hmac: false,
		maxPersistedBytes: 4096
	},
	/** Onboarding, tutorial progress — durable, synced on navigation. */
	"session-progress": {
		scope: "global",
		tier: "committed",
		transport: "json",
		persist: true,
		persistTarget: "localStorage",
		hmac: false,
		maxPersistedBytes: 8192
	},
	/** Page-level UI state (filters, selection ids) — best-effort persistence. */
	"page-ui": {
		scope: "clientOnly",
		tier: "projection",
		transport: "json",
		persist: true,
		persistTarget: "localStorage",
		hmac: false,
		maxPersistedBytes: 8192
	},
	/** Pure presentation state (viewport, drawer snap) — never persisted. */
	projection: {
		scope: "clientOnly",
		tier: "projection",
		transport: "none",
		persist: false,
		hmac: false
	}
} as const satisfies Record<string, SliceProfileSpec>;

export type SliceProfileName = keyof typeof SLICE_PROFILES;

export type SliceMeta = SliceProfileSpec & {
	profile: SliceProfileName;
};

export function resolveProfile(
	name: SliceProfileName,
	overrides?: Partial<SliceProfileSpec>
): SliceMeta {
	return {
		...SLICE_PROFILES[name],
		...overrides,
		profile: name
	};
}
