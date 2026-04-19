import type { ComponentPropsWithoutRef } from "react";

export type SkeletonProps = ComponentPropsWithoutRef<"div">;

export function Skeleton({ className = "", ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-200/90 ${className}`.trim()}
      {...props}
    />
  );
}
