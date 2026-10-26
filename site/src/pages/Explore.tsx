import { useEffect } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";

const KEYS = ["kind", "lang", "version", "category", "platform", "format", "aspect", "access", "sort"];

/** `/explore/<facet>/<value>` is the crawlable address of one filter; people landing on it get the library with that filter on. */
export function ExploreRoute() {
	const { facet, value } = useParams({ from: "/explore/$facet/$value" });
	const navigate = useNavigate();
	useEffect(() => {
		navigate({ to: "/", search: (KEYS.includes(facet) ? { [facet]: decodeURIComponent(value) } : {}) as never, hash: "library", replace: true });
	}, [facet, value, navigate]);
	return null;
}
