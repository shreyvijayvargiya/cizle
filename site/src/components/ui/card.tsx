import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Card = ({ className, ...p }: HTMLAttributes<HTMLDivElement>) => <div className={cn("rounded-lg bg-surface", className)} {...p} />;
export const CardHeader = ({ className, ...p }: HTMLAttributes<HTMLDivElement>) => <div className={cn("flex flex-col gap-1 p-5", className)} {...p} />;
export const CardTitle = ({ className, ...p }: HTMLAttributes<HTMLHeadingElement>) => <h3 className={cn("text-lg font-semibold", className)} {...p} />;
export const CardDescription = ({ className, ...p }: HTMLAttributes<HTMLParagraphElement>) => <p className={cn("text-sm text-muted-foreground", className)} {...p} />;
export const CardContent = ({ className, ...p }: HTMLAttributes<HTMLDivElement>) => <div className={cn("p-5 pt-0", className)} {...p} />;
