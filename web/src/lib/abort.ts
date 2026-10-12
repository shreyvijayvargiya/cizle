import { useMemo, useRef } from "react";
import { ApiError } from "@/lib/api";

/** Lets a button that starts a request also stop it: `next()` for the request, `stop()` for the Stop button. */
export function useAbort() {
	const ref = useRef<AbortController | null>(null);
	return useMemo(
		() => ({
			next: () => {
				ref.current = new AbortController();
				return ref.current.signal;
			},
			stop: () => ref.current?.abort(),
		}),
		[],
	);
}

export const isAborted = (e: unknown) => e instanceof ApiError && e.code === "ABORTED";
