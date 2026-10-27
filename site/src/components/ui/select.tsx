import { Select as S } from "radix-ui";
import { ArrowDown01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { Icon } from "@/components/Icon";
import { cn } from "@/lib/utils";

export const Select = S.Root;
export const SelectGroup = S.Group;
export const SelectValue = S.Value;

export function SelectTrigger({ className, children, ...p }: React.ComponentProps<typeof S.Trigger>) {
	return (
		<S.Trigger
			className={cn(
				"flex h-8 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-2.5 text-[13px] outline-none transition-colors hover:bg-tile-2 focus-visible:border-ring/60 data-[placeholder]:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 data-[size=sm]:h-7 data-[size=sm]:text-xs",
				className,
			)}
			{...p}
		>
			<span className="flex min-w-0 items-center gap-2 truncate">{children}</span>
			<S.Icon asChild>
				<Icon icon={ArrowDown01Icon} size={14} className="text-muted-foreground" />
			</S.Icon>
		</S.Trigger>
	);
}

export function SelectContent({ className, children, position = "popper", ...p }: React.ComponentProps<typeof S.Content>) {
	return (
		<S.Portal>
			<S.Content
				position={position}
				sideOffset={6}
				className={cn(
					"select-pop z-50 max-h-72 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-lg border border-input bg-background text-[13px] shadow-2xl shadow-black/20",
					className,
				)}
				{...p}
			>
				<S.Viewport className="max-h-72 p-1">{children}</S.Viewport>
			</S.Content>
		</S.Portal>
	);
}

export function SelectItem({ className, children, icon, ...p }: React.ComponentProps<typeof S.Item> & { icon?: IconSvgElement }) {
	return (
		<S.Item className={cn("relative flex cursor-default items-center gap-2 rounded-md py-1.5 pr-2 pl-7 outline-none select-none data-[highlighted]:bg-tile-2 data-[disabled]:opacity-50", className)} {...p}>
			<S.ItemIndicator className="absolute left-2 flex size-3.5 items-center justify-center">
				<Icon icon={Tick02Icon} size={13} />
			</S.ItemIndicator>
			{icon ? <Icon icon={icon} size={15} className="text-muted-foreground" /> : null}
			<S.ItemText>{children}</S.ItemText>
		</S.Item>
	);
}

export const SelectLabel = ({ className, ...p }: React.ComponentProps<typeof S.Label>) => <S.Label className={cn("px-2 py-1.5 text-xs font-medium text-muted-foreground", className)} {...p} />;
export const SelectSeparator = ({ className, ...p }: React.ComponentProps<typeof S.Separator>) => <S.Separator className={cn("-mx-1 my-1 h-px bg-border", className)} {...p} />;

/** Convenience wrapper for the common "pick one from a list" case. An empty-string value is shown as `emptyLabel`. */
export function OptionSelect({
	value,
	onValueChange,
	options,
	emptyLabel,
	className,
	size,
	"aria-label": ariaLabel,
	id,
	icon,
	emptyIcon,
}: {
	icon?: IconSvgElement;
	/** icon of the "all / any" first option */
	emptyIcon?: IconSvgElement;
	value: string;
	onValueChange: (v: string) => void;
	options: { value: string; label: React.ReactNode; icon?: IconSvgElement }[];
	emptyLabel?: string;
	className?: string;
	size?: "sm";
	"aria-label"?: string;
	id?: string;
}) {
	// Radix Select cannot use "" as an item value, so map it to a sentinel.
	const EMPTY = "__none__";
	const items: { value: string; label: React.ReactNode; icon?: IconSvgElement }[] = emptyLabel ? [{ value: EMPTY, label: emptyLabel, icon: options.length ? emptyIcon : undefined }, ...options] : options;
	const current = items.find((o) => o.value === (value === "" && emptyLabel ? EMPTY : value));
	return (
		<Select value={value === "" && emptyLabel ? EMPTY : value} onValueChange={(v) => onValueChange(v === EMPTY ? "" : v)}>
			<SelectTrigger id={id} aria-label={ariaLabel} data-size={size} className={className}>
				{current?.icon || icon ? <Icon icon={(current?.icon || icon) as IconSvgElement} size={16} className="text-muted-foreground" /> : null}
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				{items.map((o) => (
					<SelectItem key={o.value} value={o.value} icon={o.icon}>
						{o.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
