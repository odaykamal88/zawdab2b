export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-bg-surface-2 rounded ${className}`}
      aria-hidden="true"
    />
  )
}
