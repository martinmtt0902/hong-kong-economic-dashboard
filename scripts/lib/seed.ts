import type { DashboardPayload, MetricSeries } from "./types";
import { cardDefinitions, metricConfigs } from "./source";
import { createEmptyMetric } from "./series";

export function createSeedPayload(generatedAt: string): DashboardPayload {
  const metricsByCard = Object.values(metricConfigs).reduce<Record<string, MetricSeries[]>>(
    (accumulator, config) => {
      accumulator[config.cardId] ??= [];
      accumulator[config.cardId].push(
        createEmptyMetric(config, "首次部署尚未完成抓取，請執行 generate:data。")
      );
      return accumulator;
    },
    {}
  );

  return {
    generated_at: generatedAt,
    cards: cardDefinitions.map((card) => ({
      id: card.id,
      title_tc: card.title_tc,
      metrics: metricsByCard[card.id] ?? []
    }))
  };
}
