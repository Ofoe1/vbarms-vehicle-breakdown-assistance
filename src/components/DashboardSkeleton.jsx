export default function DashboardSkeleton() {
  return (
    <div className="card p-6 animate-pulse space-y-4">
      <div className="h-5 w-2/3 bg-trust-100 rounded" />
      <div className="h-3 w-1/3 bg-trust-100 rounded" />
      <div className="flex gap-2 pt-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex-1 h-8 bg-trust-100 rounded" />
        ))}
      </div>
    </div>
  );
}
