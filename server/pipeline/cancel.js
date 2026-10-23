/**
 * Cancellation without threading a signal through every function.
 *
 * Work that can be stopped (a video job, an onboarding run, a sync, an agent chat) runs inside
 * runWithSignal(signal, fn). While it runs:
 *   - every fetch() picks up that signal (the wrapper below), so model, scrape and feed calls stop at once
 *   - child processes (ffmpeg, git) get it too, via currentSignal()
 *   - throwIfCancelled() lets long loops stop at their next step
 * Code outside such a block is unaffected.
 */
import { AsyncLocalStorage } from "node:async_hooks";

const als = new AsyncLocalStorage();

export class CancelledError extends Error {
	constructor(message = "Cancelled") {
		super(message);
		this.name = "CancelledError";
		this.code = "CANCELLED";
	}
}

export const runWithSignal = (signal, fn) => als.run({ signal }, fn);
/** Run fn outside any cancellable block (for work shared between callers, like the model-list cache). */
export const detached = (fn) => als.exit(fn);
export const currentSignal = () => als.getStore()?.signal;
export const isCancelled = () => Boolean(currentSignal()?.aborted);
export const isCancelError = (e) => e?.code === "CANCELLED";

export function throwIfCancelled() {
	if (isCancelled()) throw new CancelledError();
}

const realFetch = globalThis.fetch;
if (!realFetch.__cizleCancel) {
	const wrapped = (input, init = {}) => {
		const ambient = currentSignal();
		if (!ambient) return realFetch(input, init);
		if (ambient.aborted) return Promise.reject(new CancelledError());
		const signal = init.signal ? AbortSignal.any([init.signal, ambient]) : ambient;
		return realFetch(input, { ...init, signal }).catch((e) => {
			throw ambient.aborted ? new CancelledError() : e;
		});
	};
	wrapped.__cizleCancel = true;
	globalThis.fetch = wrapped;
}
