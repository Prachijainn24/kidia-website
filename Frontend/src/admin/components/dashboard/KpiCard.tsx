import React from "react";

interface KpiCardProps {
  title: string;
  value: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
  change?: number;
  loading?: boolean;
  comparisonLabel?: string;
  subtitle?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  icon: IconComponent,
  badge,
  change,
  loading = false,
  comparisonLabel = "vs last month",
  subtitle,
}) => {
  const isPositive = typeof change === "number" && change > 0;
  const isNegative = typeof change === "number" && change < 0;
  const isZero = typeof change === "number" && change === 0;

  return (
    <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-soft hover:shadow-lift hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group text-left flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between">
          <div className="text-primary bg-primary/10 border border-primary/20 w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
            {IconComponent && <IconComponent className="w-5 h-5" />}
          </div>
          {badge && (
            <span className="text-[10px] font-extrabold uppercase bg-butter/60 text-foreground border border-butter px-2.5 py-0.5 rounded-full tracking-wider">
              {badge}
            </span>
          )}
        </div>

        <h3 className="mt-3 text-[11px] sm:text-xs font-extrabold text-muted-foreground uppercase tracking-wider leading-none">
          {title}
        </h3>

        <div className="mt-2 text-xl sm:text-2xl font-display font-black text-foreground tracking-tight leading-none break-words">
          {loading ? (
            <span className="inline-block h-6 w-20 bg-muted/60 rounded animate-pulse mt-1"></span>
          ) : (
            value
          )}
        </div>
      </div>

      {loading ? (
        <div className="mt-3 pt-3 border-t border-border/40 flex items-center h-[26px]">
          <span className="inline-block h-3.5 w-24 bg-muted/40 rounded animate-pulse"></span>
        </div>
      ) : typeof change === "number" ? (
        <div className="mt-3 pt-3 border-t border-border/40 flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold">
          {isPositive && (
            <span className="text-primary bg-primary-soft/50 px-1.5 py-0.5 rounded font-extrabold flex items-center gap-0.5">
              ↑ {change.toFixed(1)}%
            </span>
          )}
          {isNegative && (
            <span className="text-accent bg-accent/10 px-1.5 py-0.5 rounded font-extrabold flex items-center gap-0.5">
              ↓ {Math.abs(change).toFixed(1)}%
            </span>
          )}
          {isZero && (
            <span className="text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded font-extrabold">
              ~ 0.0%
            </span>
          )}
          <span className="text-muted-foreground">{comparisonLabel}</span>
        </div>
      ) : subtitle ? (
        <div className="mt-3 pt-3 border-t border-border/40 flex items-center gap-1.5 text-[10px] sm:text-[11px] font-medium text-muted-foreground">
          <span className="w-1.5 h-1.5 rounded-full bg-border shrink-0"></span>
          <span className="truncate">{subtitle}</span>
        </div>
      ) : null}
    </div>
  );
};

export default KpiCard;
