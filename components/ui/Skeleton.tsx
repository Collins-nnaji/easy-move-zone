import { clsx } from "clsx"

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={clsx("animate-pulse rounded-xl bg-black/10", className)}
      aria-hidden
    />
  )
}

export function SkeletonLines({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className={clsx("h-3", i === count - 1 ? "w-2/3" : "w-full")} />
      ))}
    </div>
  )
}
