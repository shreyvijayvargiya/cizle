import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, type ColumnDef, type SortingState } from "@tanstack/react-table";
import { ArrowDown01Icon, GithubIcon, Mic01Icon, MusicNote01Icon, Search01Icon, Video01Icon, VolumeOffIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/Icon";
import { StatusBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/misc";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fileUrl, type VideoRow } from "@/lib/api";
import { cn, hostOf, timeAgo, usd } from "@/lib/utils";

const STATUS_FILTERS = [
	{ value: "", label: "All" },
	{ value: "success", label: "Ready" },
	{ value: "running", label: "Rendering" },
	{ value: "failed", label: "Failed" },
];

export function VideosTable({ data, loading, compact, emptyAction }: { data: VideoRow[]; loading?: boolean; compact?: boolean; emptyAction?: React.ReactNode }) {
	const navigate = useNavigate();
	const [query, setQuery] = useState("");
	const [status, setStatus] = useState("");
	const [type, setType] = useState("");
	const [sorting, setSorting] = useState<SortingState>([{ id: "created_at", desc: true }]);

	const types = useMemo(() => [...new Set(data.map((d) => d.type).filter(Boolean))], [data]);
	const filtered = useMemo(
		() =>
			data.filter(
				(d) =>
					(!status || (status === "running" ? d.status === "running" || d.status === "pending" : d.status === status)) &&
					(!type || d.type === type) &&
					(!query || `${d.title} ${d.url} ${d.type}`.toLowerCase().includes(query.toLowerCase())),
			),
		[data, status, type, query],
	);

	const columns = useMemo<ColumnDef<VideoRow>[]>(
		() => [
			{
				id: "video",
				header: "Video",
				accessorFn: (r) => r.title,
				cell: ({ row: { original: v } }) => {
					const thumb = fileUrl(v.id, v.thumbnail_path);
					return (
						<div className="flex min-w-0 items-center gap-3">
							<div className={cn("flex shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted", v.aspect === "16:9" ? "h-9 w-16" : v.aspect === "1:1" ? "size-10" : "h-12 w-7")}>
								{thumb ? <img src={thumb} alt="" className="size-full object-cover" loading="lazy" /> : <Icon icon={Video01Icon} size={14} className="text-muted-foreground" />}
							</div>
							<div className="min-w-0">
								<p className="truncate font-medium">{v.title}</p>
								<p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
									{v.github_url || /github\.com/.test(v.url) ? <Icon icon={GithubIcon} size={11} /> : null}
									{hostOf(v.url)}
								</p>
							</div>
						</div>
					);
				},
			},
			{ id: "type", header: "Type", accessorKey: "type", cell: ({ getValue }) => <Badge tone="outline">{String(getValue() || "Auto")}</Badge> },
			{ id: "status", header: "Status", accessorKey: "status", cell: ({ row: { original: v } }) => <StatusBadge status={v.status} step={v.step} progress={v.progress} /> },
			{
				id: "format",
				header: "Format",
				accessorFn: (r) => r.aspect,
				cell: ({ row: { original: v } }) => (
					<span className="flex items-center gap-1.5 text-xs text-muted-foreground">
						<Icon icon={v.audio === "voice" ? Mic01Icon : v.audio === "music" ? MusicNote01Icon : VolumeOffIcon} size={13} />
						{v.aspect}
						{v.duration_sec ? ` · ${Math.round(v.duration_sec)}s` : ""}
						{v.variants > 1 ? ` · ${v.variants}×` : ""}
					</span>
				),
			},
			{ id: "cost", header: "Cost", accessorKey: "cost_usd", cell: ({ getValue }) => <span className="text-xs text-muted-foreground tabular-nums">{usd(getValue() as number | null)}</span> },
			{ id: "created_at", header: "Created", accessorKey: "created_at", cell: ({ getValue }) => <span className="text-xs whitespace-nowrap text-muted-foreground">{timeAgo(getValue() as string)}</span> },
		],
		[],
	);

	const table = useReactTable({
		data: filtered,
		columns,
		state: { sorting },
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		initialState: { pagination: { pageSize: compact ? 5 : 10 } },
	});

	return (
		<div className="overflow-hidden rounded-xl border border-border bg-surface">
			{compact ? null : (
				<div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
					<div className="relative w-full sm:w-72">
						<Icon icon={Search01Icon} size={15} className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground" />
						<Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search videos" className="pl-8" />
					</div>
					<div className="flex items-center gap-1 rounded-lg bg-muted p-1">
						{STATUS_FILTERS.map((f) => (
							<button
								key={f.value}
								type="button"
								onClick={() => setStatus(f.value)}
								className={cn("h-7 rounded-md px-2.5 text-xs font-medium", status === f.value ? "bg-surface shadow-sm" : "text-muted-foreground hover:text-foreground")}
							>
								{f.label}
							</button>
						))}
					</div>
					{types.length > 1 ? (
						<select value={type} onChange={(e) => setType(e.target.value)} className="h-9 rounded-lg border border-input bg-surface px-2.5 text-xs" aria-label="Filter by type">
							<option value="">All types</option>
							{types.map((t) => (
								<option key={t} value={t}>
									{t}
								</option>
							))}
						</select>
					) : null}
					<span className="ml-auto text-xs text-muted-foreground">{filtered.length} videos</span>
				</div>
			)}
			<Table>
				<TableHeader>
					{table.getHeaderGroups().map((hg) => (
						<TableRow key={hg.id} className="hover:bg-transparent">
							{hg.headers.map((h) => (
								<TableHead key={h.id} className={cn(h.column.id === "video" && "w-[38%] pl-4", (h.column.id === "cost" || h.column.id === "format") && "hidden md:table-cell")}>
									{h.column.getCanSort() ? (
										<button type="button" onClick={h.column.getToggleSortingHandler()} className="inline-flex items-center gap-1 hover:text-foreground">
											{flexRender(h.column.columnDef.header, h.getContext())}
											{h.column.getIsSorted() ? <Icon icon={ArrowDown01Icon} size={12} className={h.column.getIsSorted() === "asc" ? "rotate-180" : ""} /> : null}
										</button>
									) : (
										flexRender(h.column.columnDef.header, h.getContext())
									)}
								</TableHead>
							))}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{loading ? (
						Array.from({ length: compact ? 3 : 5 }).map((_, i) => (
							<TableRow key={i}>
								<TableCell colSpan={6} className="pl-4">
									<Skeleton className="h-9 w-full" />
								</TableCell>
							</TableRow>
						))
					) : table.getRowModel().rows.length ? (
						table.getRowModel().rows.map((row) => (
							<TableRow key={row.id} onClick={() => navigate({ to: "/videos/$id", params: { id: row.original.id } })} className="cursor-pointer hover:bg-accent/60">
								{row.getVisibleCells().map((cell) => (
									<TableCell key={cell.id} className={cn(cell.column.id === "video" && "max-w-0 pl-4", (cell.column.id === "cost" || cell.column.id === "format") && "hidden md:table-cell")}>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TableCell>
								))}
							</TableRow>
						))
					) : (
						<TableRow className="hover:bg-transparent">
							<TableCell colSpan={6} className="py-12 text-center">
								<div className="mx-auto flex max-w-xs flex-col items-center gap-2">
									<span className="flex size-10 items-center justify-center rounded-full bg-muted">
										<Icon icon={Video01Icon} size={18} className="text-muted-foreground" />
									</span>
									<p className="text-sm font-medium">{data.length ? "No videos match" : "No videos yet"}</p>
									<p className="text-xs text-muted-foreground">{data.length ? "Try a different search or filter." : "Paste a product URL in the composer to make your first one."}</p>
									{!data.length && emptyAction ? <div className="mt-1">{emptyAction}</div> : null}
								</div>
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
			{!compact && table.getPageCount() > 1 ? (
				<div className="flex items-center justify-between border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
					<span>
						Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
					</span>
					<div className="flex gap-1.5">
						<Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
							Previous
						</Button>
						<Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
							Next
						</Button>
					</div>
				</div>
			) : null}
		</div>
	);
}
