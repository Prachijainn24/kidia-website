import React from "react";

const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-card rounded-2xl border border-border/60 p-4">
            <div className="w-8 h-8 rounded-xl bg-muted/60 mb-3" />
            <div className="h-4 w-20 bg-muted/60 rounded mb-2" />
            <div className="h-6 w-28 bg-muted/60 rounded" />
          </div>
        ))}
      </div>

      {/* Main Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80 bg-card rounded-2xl border border-border/60 p-6" />
        <div className="h-80 bg-card rounded-2xl border border-border/60 p-6" />
      </div>

      {/* Secondary Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="h-80 bg-card rounded-2xl border border-border/60 p-6" />
        <div className="h-80 bg-card rounded-2xl border border-border/60 p-6" />
        <div className="h-80 bg-card rounded-2xl border border-border/60 p-6" />
      </div>
    </div>
  );
};

export default DashboardSkeleton;
