import { Suspense } from "react";
import { Boxes, CalendarClock, Layers } from "lucide-react";
import { PageHeader } from "@/components/design-system/page-header";
import { MetricCard, MetricCardSkeleton } from "@/components/design-system/metric-card";
import { DemoItemsSection } from "@/components/design-system/demo-items-section";
import { countDemoItems, listDemoItems } from "@/server/actions/demo-item";

export default function Home() {
  return (
    <div>
      <PageHeader
        title="Visão geral"
        description="Vitrine do design system — layout, tokens, tipografia e o padrão de dados (Server Actions + Prisma) que toda tela futura vai herdar."
      />

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Suspense fallback={<MetricsSkeleton />}>
          <Metrics />
        </Suspense>
      </div>

      <Suspense fallback={null}>
        <DemoItemsSectionAsync />
      </Suspense>
    </div>
  );
}

function MetricsSkeleton() {
  return (
    <>
      <MetricCardSkeleton />
      <MetricCardSkeleton />
      <MetricCardSkeleton />
    </>
  );
}

async function Metrics() {
  const [total, items] = await Promise.all([countDemoItems(), listDemoItems()]);

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const createdThisWeek = items.filter((item) => item.createdAt >= weekAgo).length;
  const latest = items[0];

  return (
    <>
      <MetricCard
        label="Itens registrados"
        value={String(total)}
        icon={<Boxes />}
        trend={total > 0 ? "up" : "neutral"}
        trendLabel={total > 0 ? `${createdThisWeek} esta semana` : undefined}
        context="total na base"
        delay={0}
      />
      <MetricCard
        label="Criados esta semana"
        value={String(createdThisWeek)}
        icon={<CalendarClock />}
        trend="neutral"
        context="últimos 7 dias"
        delay={0.05}
      />
      <MetricCard
        label="Último registro"
        value={latest ? latest.title : "—"}
        icon={<Layers />}
        trend="neutral"
        context={latest ? "mais recente" : "nenhum item ainda"}
        delay={0.1}
      />
    </>
  );
}

async function DemoItemsSectionAsync() {
  const items = await listDemoItems();
  return <DemoItemsSection items={items} />;
}
