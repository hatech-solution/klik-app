import type { ComponentPropsWithoutRef } from "react";

export type SkeletonProps = ComponentPropsWithoutRef<"div">;

export function Skeleton({ className = "", ...props }: SkeletonProps) {
  return (
    <div
      className={`ui-skeleton animate-pulse rounded-md ${className}`.trim()}
      {...props}
    />
  );
}
