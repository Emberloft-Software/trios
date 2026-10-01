/* eslint-disable @next/next/no-img-element */
export function EmptyState({
  title,
  action,
  className = "",
}: {
  title: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`glass flex flex-col items-center rounded-[var(--radius-xl3)] px-6 py-10 text-center ${className}`}>
      <img src="/brand/mark-256.png" alt="" width={72} height={72} className="mb-4 rounded-[28%] opacity-90" />
      <p className="max-w-sm text-[0.9375rem] text-muted">{title}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
