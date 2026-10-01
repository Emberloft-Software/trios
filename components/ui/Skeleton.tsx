/** Placeholder blocks shown by loading.tsx while a route streams in. */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`animate-pulse rounded-2xl bg-plum/[0.07] ${className}`} />;
}

export function PageSkeleton({ cards = 3 }: { cards?: number }) {
  return (
    <div role="status" aria-label="Loading" className="mx-auto max-w-3xl">
      <Skeleton className="mb-2 h-9 w-48" />
      <Skeleton className="mb-6 h-4 w-72" />
      <div className="space-y-4">
        {Array.from({ length: cards }, (_, i) => (
          <div key={i} className="glass rounded-[1.75rem] p-5">
            <Skeleton className="mb-3 h-5 w-1/2" />
            <Skeleton className="mb-2 h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
