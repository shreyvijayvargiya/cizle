import { useQuery } from "@tanstack/react-query";

export type Creator = {
	key: string;
	name: string | null;
	handle: string;
	platform: "x" | "github";
	url: string;
	prompts: number;
	skills: number;
	total: number;
	languages: string[];
	collections: string[];
	categories: string[];
	first: string | null;
	last: string | null;
};
export type CreatorsIndex = { generatedAt: string; total: number; platforms: Record<string, number>; creators: Creator[] };

/** Every unique creator in the library (public/creators.json, built from the classic gallery and every harvest version). */
export const useCreators = () =>
	useQuery({
		queryKey: ["creators"],
		queryFn: async (): Promise<CreatorsIndex> => {
			const res = await fetch("/creators.json");
			if (!res.ok) throw new Error(`Could not load the creators (${res.status})`);
			return res.json();
		},
		staleTime: 10 * 60_000,
		gcTime: 60 * 60_000,
	});
