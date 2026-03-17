import type { DataPoint } from "../types";

export function Sparkline({ points }: { points: DataPoint[] }) {
  if (points.length < 2) {
    return <div className="sparkline sparkline-empty">-</div>;
  }

  const values = points.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const path = points
    .map((point, index) => {
      const x = (index / (points.length - 1)) * 100;
      const y = 100 - ((point.value - min) / range) * 100;
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <svg className="sparkline" viewBox="0 0 100 100" preserveAspectRatio="none">
      <path d={path} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
