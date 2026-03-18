import { useMemo, useState } from "react";
import type { UIChart } from "../types";

const width = 220;
const height = 112;
const margin = { top: 10, right: 10, bottom: 26, left: 44 };

export function Sparkline({ chart }: { chart: UIChart }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(chart.points.length ? chart.points.length - 1 : null);

  const geometry = useMemo(() => {
    if (chart.points.length === 0) {
      return null;
    }

    const values = chart.points.map((point) => point.y);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;
    const valueSpan = maxValue - minValue || 1;

    const points = chart.points.map((point, index) => {
      const x = margin.left + (chart.points.length === 1 ? plotWidth / 2 : (index / (chart.points.length - 1)) * plotWidth);
      const y = margin.top + plotHeight - ((point.y - minValue) / valueSpan) * plotHeight;
      return { ...point, svgX: x, svgY: y };
    });

    const ticks = [0, 0.5, 1].map((ratio) => {
      const rawValue = maxValue - ratio * valueSpan;
      return {
        y: margin.top + ratio * plotHeight,
        label: formatYAxisTick(rawValue, chart.display_unit)
      };
    });

    return { points, ticks, plotWidth, plotHeight };
  }, [chart]);

  if (!geometry) {
    return <div className="sparkline sparkline-empty">-</div>;
  }

  const activePoint = activeIndex !== null ? geometry.points[activeIndex] : undefined;
  const path = chart.chart_type === "step_after" ? stepPath(geometry.points) : linePath(geometry.points);

  return (
    <div className="mini-chart">
      <div className="mini-chart-axis mini-chart-axis-y">{chart.y_axis_label}</div>
      <svg
        className="sparkline"
        viewBox={`0 0 ${width} ${height}`}
        onMouseLeave={() => setActiveIndex(chart.points.length - 1)}
      >
        <line x1={margin.left} y1={height - margin.bottom} x2={width - margin.right} y2={height - margin.bottom} className="axis-line" />
        <line x1={margin.left} y1={margin.top} x2={margin.left} y2={height - margin.bottom} className="axis-line" />

        {geometry.ticks.map((tick) => (
          <g key={tick.label}>
            <line x1={margin.left} y1={tick.y} x2={width - margin.right} y2={tick.y} className="grid-line" />
            <text x={margin.left - 6} y={tick.y + 4} className="axis-text axis-text-left">
              {tick.label}
            </text>
          </g>
        ))}

        {chart.suggested_ticks.map((tick) => {
          const point = geometry.points.find((item) => item.tick_label === tick);
          if (!point) {
            return null;
          }
          return (
            <text key={tick} x={point.svgX} y={height - 8} className="axis-text axis-text-bottom">
              {tick}
            </text>
          );
        })}

        <path d={path} className="sparkline-path" />

        {geometry.points.map((point, index) => (
          <circle
            key={`${point.x}-${point.tick_label}`}
            cx={point.svgX}
            cy={point.svgY}
            r={activeIndex === index ? 4.5 : 3}
            className={activeIndex === index ? "chart-point chart-point-active" : "chart-point"}
            onMouseEnter={() => setActiveIndex(index)}
          />
        ))}
      </svg>
      <div className="mini-chart-axis mini-chart-axis-x">{chart.x_axis_label}</div>
      {activePoint ? (
        <div className="mini-chart-tooltip" role="note">
          <div>{activePoint.tooltip_title}</div>
          <div>{activePoint.tooltip_value_text}</div>
        </div>
      ) : null}
    </div>
  );
}

function linePath(points: Array<{ svgX: number; svgY: number }>): string {
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.svgX} ${point.svgY}`).join(" ");
}

function stepPath(points: Array<{ svgX: number; svgY: number }>): string {
  if (points.length === 0) {
    return "";
  }

  const commands = [`M ${points[0].svgX} ${points[0].svgY}`];
  for (let index = 1; index < points.length; index += 1) {
    const point = points[index];
    const previous = points[index - 1];
    commands.push(`L ${point.svgX} ${previous.svgY}`);
    commands.push(`L ${point.svgX} ${point.svgY}`);
  }
  return commands.join(" ");
}

function formatYAxisTick(value: number, displayUnit: string): string {
  if (displayUnit === "%" || displayUnit === "指數" || displayUnit === "歲") {
    return `${value.toFixed(1)}${displayUnit === "%" ? "%" : ""}`;
  }

  if (displayUnit === "億港元") {
    return `${value.toFixed(0)}億`;
  }

  if (displayUnit === "HK$/小時") {
    return `HK$${value.toFixed(1)}`;
  }

  return new Intl.NumberFormat("zh-Hant-HK", { maximumFractionDigits: 0 }).format(value);
}
