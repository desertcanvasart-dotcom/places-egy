import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FadeInSectionProps {
  children: ReactNode;
  className?: string;
}

export function FadeInSection({ children, className }: FadeInSectionProps) {
  return <div className={cn(className)}>{children}</div>;
}
