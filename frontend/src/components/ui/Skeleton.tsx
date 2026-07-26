export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-steel/30 rounded-lg ${className}`} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-steel/20">
      <Skeleton className="h-48 rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center py-32">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
