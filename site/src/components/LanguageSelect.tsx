import { useMemo, useState } from "react";
import { Popover as P } from "radix-ui";
import { ArrowDown01Icon, Globe02Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/Icon";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { languageOf } from "@/lib/languages";
import { cn } from "@/lib/utils";

/**
 * Language filter: a searchable dropdown. Type a language in English, in its own script or by code ("ja", "日本", "esp") and the list narrows;
 * every row shows the flag, both names and how many prompts and skills there are. Languages come from the data, so a new version that brings
 * new languages shows them without a code change.
 */
export function LanguageSelect({ value, onChange, counts, className }: { value: string; onChange: (code: string) => void; counts: Record<string, number>; className?: string }) {
	const [open, setOpen] = useState(false);
	const [q, setQ] = useState("");
	const total = useMemo(() => Object.values(counts).reduce((a, b) => a + b, 0), [counts]);
	const rows = useMemo(() => Object.entries(counts).map(([code, n]) => ({ ...languageOf(code), code, n })).sort((a, b) => b.n - a.n), [counts]);
	const shown = useMemo(() => {
		const t = q.trim().toLowerCase();
		return t ? rows.filter((r) => `${r.code} ${r.name} ${r.native}`.toLowerCase().includes(t)) : rows;
	}, [rows, q]);
	const current = value ? languageOf(value) : null;
	const pick = (code: string) => (onChange(code), setOpen(false), setQ(""));
	return (
		<P.Root open={open} onOpenChange={(o) => (setOpen(o), !o && setQ(""))}>
			<P.Trigger
				aria-label="Language"
				className={cn("flex h-8 items-center justify-between gap-2 rounded-md border border-input bg-background px-2.5 text-[13px] outline-none transition-colors hover:bg-tile-2 focus-visible:border-ring/60", className)}
			>
				<span className="flex min-w-0 items-center gap-2 truncate">
					{current ? <span aria-hidden className="text-base leading-none">{current.flag}</span> : <Icon icon={Globe02Icon} size={16} className="text-muted-foreground" />}
					<span className="truncate">{current ? current.native : "All languages"}</span>
				</span>
				<Icon icon={ArrowDown01Icon} size={14} className="text-muted-foreground" />
			</P.Trigger>
			<P.Portal>
				<P.Content align="start" sideOffset={6} className="menu-pop z-50 w-[19rem] overflow-hidden rounded-lg border border-input bg-background text-[13px] shadow-2xl shadow-black/20" style={{ transformOrigin: "var(--radix-popover-content-transform-origin)" }}>
					<Command shouldFilter={false} loop>
						<CommandInput value={q} onValueChange={setQ} placeholder="Search languages…" autoFocus />
						<CommandList className="max-h-72">
							<CommandEmpty>No language matches “{q}”.</CommandEmpty>
							<CommandGroup>
								{!q ? (
									<CommandItem value="all" onSelect={() => pick("")} className="gap-2">
										<Icon icon={Globe02Icon} size={16} className="text-muted-foreground" />
										<span className="flex-1">All languages</span>
										{!value ? <Icon icon={Tick02Icon} size={13} /> : null}
									</CommandItem>
								) : null}
								{shown.map((r) => (
									<CommandItem key={r.code} value={r.code} onSelect={() => pick(r.code)} className="gap-2">
										<span aria-hidden className="text-base leading-none">{r.flag}</span>
										<span className="flex min-w-0 flex-1 items-baseline gap-2">
											<span className="truncate">{r.native}</span>
											{r.native !== r.name ? <span className="truncate text-xs text-muted-foreground">{r.name}</span> : null}
										</span>
										{value === r.code ? <Icon icon={Tick02Icon} size={13} /> : null}
									</CommandItem>
								))}
							</CommandGroup>
						</CommandList>
					</Command>
				</P.Content>
			</P.Portal>
		</P.Root>
	);
}
