import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useProducts, type ProductMeta, type Tier } from "@/lib/api";

/**
 * Which product the dashboard is scoped to, and whether new generations use a free or paid model.
 * Both are remembered in localStorage; the product list itself lives on disk (products/<slug>/).
 */
type Workspace = {
	/** Active product slug, or "" when showing everything. */
	slug: string;
	product: ProductMeta | undefined;
	products: ProductMeta[];
	productsLoaded: boolean;
	setSlug: (slug: string) => void;
	tier: Tier;
	setTier: (t: Tier) => void;
};

const Ctx = createContext<Workspace | null>(null);
const K_PRODUCT = "cizle-product";
const K_TIER = "cizle-tier";

const read = (k: string) => {
	try {
		return localStorage.getItem(k);
	} catch {
		return null;
	}
};
const write = (k: string, v: string) => {
	try {
		localStorage.setItem(k, v);
	} catch {
		/* storage unavailable */
	}
};

export function WorkspaceProvider({ children }: { children: ReactNode }) {
	const query = useProducts();
	const products = useMemo(() => query.data || [], [query.data]);
	const [stored, setStored] = useState<string | null>(() => read(K_PRODUCT));
	const [storedTier, setStoredTier] = useState<string | null>(() => read(K_TIER));

	const slug = stored === "all" ? "" : products.find((p) => p.slug === stored)?.slug || products[0]?.slug || "";
	const setSlug = useCallback((s: string) => {
		const v = s || "all";
		setStored(v);
		write(K_PRODUCT, v);
	}, []);
	const setTier = useCallback((t: Tier) => {
		setStoredTier(t);
		write(K_TIER, t);
	}, []);

	// A brand-new install starts on free models; anyone who has chosen keeps their choice.
	const tier: Tier = storedTier === "free" || storedTier === "paid" ? storedTier : query.isSuccess && products.length === 0 ? "free" : "paid";
	const value = useMemo<Workspace>(
		() => ({ slug, product: products.find((p) => p.slug === slug), products, productsLoaded: query.isSuccess, setSlug, tier, setTier }),
		[slug, products, query.isSuccess, setSlug, tier, setTier],
	);
	return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWorkspace() {
	const v = useContext(Ctx);
	if (!v) throw new Error("useWorkspace must be used inside WorkspaceProvider");
	return v;
}
