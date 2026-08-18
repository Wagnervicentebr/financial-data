"use client";

import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Trend = "up" | "down" | "neutral";

export function MetricCard({
  label,
  value,
  icon,
  trend,
  trendLabel,
  context,
  delay = 0,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  trend?: Trend;
  trendLabel?: string;
  context?: string;
  delay?: number;
}) {
  const trendTone =
    trend === "up"
      ? "text-success bg-success/10"
      : trend === "down"
        ? "text-destructive bg-destructive/10"
        : "text-muted-foreground bg-muted";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className="transition-shadow duration-200 hover:shadow-[var(--shadow-elevation-2)]">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {label}
          </CardTitle>
          {icon && (
            <div className="flex size-8 items-center justify-center rounded-md bg-accent/10 text-accent [&_svg]:size-4">
              {icon}
            </div>
          )}
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <span className="font-display text-[2rem] leading-none font-semibold tracking-tight text-foreground tabular-nums">
            {value}
          </span>
          <div className="flex items-center gap-2">
            {trend && trend !== "neutral" && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium",
                  trendTone
                )}
              >
                {trend === "up" ? (
                  <ArrowUpRight className="size-3" />
                ) : (
                  <ArrowDownRight className="size-3" />
                )}
                {trendLabel}
              </span>
            )}
            {context && (
              <span className="text-xs text-muted-foreground">{context}</span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function MetricCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="size-8 animate-pulse rounded-md bg-muted" />
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="h-8 w-28 animate-pulse rounded bg-muted" />
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
      </CardContent>
    </Card>
  );
}
