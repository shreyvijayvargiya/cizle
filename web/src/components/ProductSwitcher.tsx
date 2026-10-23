import { useNavigate } from "@tanstack/react-router";
import { ArrowDown01Icon, Package01Icon, PlusSignIcon, Settings01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/button";
import { Menu, MenuContent, MenuItem, MenuLabel, MenuRadioGroup, MenuRadioItem, MenuSeparator, MenuTrigger } from "@/components/ui/menu";
import { useWorkspace } from "@/lib/workspace";
import { cn } from "@/lib/utils";

function Avatar({ name, className }: { name?: string; className?: string }) {
	return (
		<span className={cn("flex size-6 shrink-0 items-center justify-center rounded-md bg-brand/15 text-xs font-semibold text-brand uppercase", className)}>
			{name ? name.trim().charAt(0) : <Icon icon={Package01Icon} size={13} />}
		</span>
	);
}

/** Sidebar dropdown: pick the product the dashboard is scoped to, or add one. */
export function ProductSwitcher({ slim, onNavigate }: { slim?: boolean; onNavigate?: () => void }) {
	const navigate = useNavigate();
	const { slug, product, products, setSlug } = useWorkspace();
	const go = (to: string) => {
		onNavigate?.();
		navigate({ to });
	};
	return (
		<Menu>
			<MenuTrigger asChild>
				{slim ? (
					<Button variant="ghost" size="icon" className="mx-auto" aria-label="Switch product">
						<Avatar name={product?.name} />
					</Button>
				) : (
					<Button variant="outline" className="h-9 w-full justify-between px-2 font-medium" aria-label="Switch product">
						<span className="flex min-w-0 items-center gap-2">
							<Avatar name={product?.name} />
							<span className="truncate">{product ? product.name : products.length ? "All products" : "Add a product"}</span>
						</span>
						<Icon icon={ArrowDown01Icon} size={14} className="text-muted-foreground" />
					</Button>
				)}
			</MenuTrigger>
			<MenuContent className="w-60" align="start">
				{products.length ? (
					<>
						<MenuLabel>Products</MenuLabel>
						<MenuRadioGroup value={slug || "all"} onValueChange={setSlug}>
							{products.map((p) => (
								<MenuRadioItem key={p.slug} value={p.slug}>
									<span className="min-w-0">
										<span className="block truncate">{p.name}</span>
										<span className="block truncate text-[11px] text-muted-foreground">{p.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}</span>
									</span>
								</MenuRadioItem>
							))}
							<MenuRadioItem value="all">All products</MenuRadioItem>
						</MenuRadioGroup>
						<MenuSeparator />
					</>
				) : null}
				<MenuItem onSelect={() => go("/products/new")}>
					<Icon icon={PlusSignIcon} size={14} /> Add product
				</MenuItem>
				{product ? (
					<MenuItem onSelect={() => go("/product")}>
						<Icon icon={Settings01Icon} size={14} /> Product memory
					</MenuItem>
				) : null}
			</MenuContent>
		</Menu>
	);
}
