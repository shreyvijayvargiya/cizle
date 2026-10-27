/** Stands in for firebase-admin in the Cloudflare Worker (see wrangler.jsonc "alias"): the Worker runs the free launch, which needs no database. */
const off = () => { throw new Error("The database is not available on this deployment."); };
export const cert = off, getApps = () => [], initializeApp = off, getFirestore = off;
export const FieldValue = { increment: off };
