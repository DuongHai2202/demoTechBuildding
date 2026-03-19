interface LoadingSkeletonProps {
  className?: string;
}

export function LoadingSkeleton({ className }: LoadingSkeletonProps) {
  if (className) {
    return (
      <div className={`animate-pulse rounded bg-[var(--color-surface-alt)] ${className}`} />
    );
  }

  return (
    <div className="animate-pulse space-y-4 p-6">
      <div className="h-8 w-1/3 rounded bg-[var(--color-surface-alt)]" />
      <div className="space-y-3">
        <div className="h-4 rounded bg-[var(--color-surface-alt)]" />
        <div className="h-4 w-5/6 rounded bg-[var(--color-surface-alt)]" />
        <div className="h-4 w-4/6 rounded bg-[var(--color-surface-alt)]" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="h-24 rounded-lg bg-[var(--color-surface-alt)]" />
        <div className="h-24 rounded-lg bg-[var(--color-surface-alt)]" />
        <div className="h-24 rounded-lg bg-[var(--color-surface-alt)]" />
      </div>
    </div>
  );
}
