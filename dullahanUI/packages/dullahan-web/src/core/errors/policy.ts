import type { DullahanError } from "./types";

export type ErrorDisposition = "silent" | "return" | "throw";

export type PresentChannel =
	| { type: "dev-console"; level: "warn" | "error" }
	| { type: "client-console"; level: "warn" | "error" }
	| { type: "server-log"; level: "warn" | "error" }
	| { type: "telemetry" }
	| { type: "inline"; scope: string }
	| { type: "transition-hook" }
	| { type: "toast" }
	| { type: "modal" };

export type ErrorPolicy = {
	disposition: ErrorDisposition;
	present: PresentChannel[];
	sanitize?: boolean;
};

function isDev(): boolean {
	const proc = (globalThis as { process?: { env?: { NODE_ENV?: string } } })
		.process;
	return proc?.env?.NODE_ENV !== "production";
}

function channelsForServerKind(kind: DullahanError["kind"]): PresentChannel[] {
	switch (kind) {
		case "validation":
			return [
				{ type: "inline", scope: "transition" },
				{ type: "transition-hook" },
				{ type: "dev-console", level: "warn" }
			];
		case "domain":
			return [
				{ type: "toast" },
				{ type: "transition-hook" },
				{ type: "dev-console", level: "warn" },
				{ type: "server-log", level: "warn" }
			];
		case "network":
			return [
				{ type: "toast" },
				{ type: "client-console", level: "warn" },
				{ type: "server-log", level: "warn" }
			];
		case "internal":
			return [
				{ type: "dev-console", level: "error" },
				{ type: "server-log", level: "error" }
			];
	}
}

export const errorPolicies = {
	transition: {
		input: (id: string): ErrorPolicy => ({
			disposition: "return",
			present: [
				{ type: "inline", scope: `transition:${id}` },
				{ type: "transition-hook" },
				{ type: "dev-console", level: "warn" }
			]
		}),
		apply: (): ErrorPolicy => ({
			disposition: "return",
			present: [
				{ type: "dev-console", level: "error" },
				{ type: "telemetry" }
			]
		}),
		server: (kind?: DullahanError["kind"]): ErrorPolicy => ({
			disposition: "return",
			present: kind ? channelsForServerKind(kind) : channelsForServerKind("domain")
		})
	},
	persist: {
		rehydrate: (_namespace: string): ErrorPolicy => ({
			disposition: "silent",
			present: [{ type: "dev-console", level: "warn" }],
			sanitize: false
		})
	},
	cookie: {
		hint: (_namespace: string): ErrorPolicy => ({
			disposition: "silent",
			present: [{ type: "dev-console", level: "warn" }],
			sanitize: false
		})
	},
	page: {
		snapshot: (_scope: string): ErrorPolicy => ({
			disposition: "silent",
			present: [{ type: "dev-console", level: "warn" }],
			sanitize: false
		})
	},
	wiring: {
		registry: (): ErrorPolicy => ({
			disposition: isDev() ? "throw" : "return",
			present: isDev()
				? [{ type: "dev-console", level: "error" }]
				: [
						{ type: "dev-console", level: "error" },
						{ type: "server-log", level: "error" }
					]
		}),
		port: (): ErrorPolicy => ({
			disposition: "return",
			present: [{ type: "dev-console", level: "warn" }]
		})
	}
} as const;

export function resolvePolicy(
	base: ErrorPolicy,
	override?: Partial<ErrorPolicy>
): ErrorPolicy {
	if (!override) return base;
	return {
		...base,
		...override,
		present: override.present ?? base.present
	};
}

export function mergePolicyWithKind(
	base: ErrorPolicy,
	kind: DullahanError["kind"],
	concern: import("./types").ErrorConcern
): ErrorPolicy {
	if (concern === "transition.server") {
		return {
			...base,
			present: channelsForServerKind(kind)
		};
	}
	return base;
}
