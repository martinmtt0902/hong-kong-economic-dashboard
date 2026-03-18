import { useEffect, useMemo, useState } from "react";
import type { UIChart } from "../types";

const width = 220;
const height = 128;
const margin = { top: 10, right: 10, bottom: 28, left: 46 };

export function Sparkline({ chart }: { chart: UIChart }) {
  const defaultIndex = chart.points.length ? chart.points.length - 1 : null;
  const [activeIndex, setActiveIndex] = useState<number | null>(defaultIndex);

  useEffect(() => {
    setActiveIndex(defaultIndex);
  }, [defaultIndex]);

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
    const padding = valueSpan * 0.08;
    const domainMin = minValue - padding;
    const domainMax = maxValue + padding;
    const domainSpan = domainMax - domainMin || 1;

    const points = chart.points.map((point, index) => {
      const x = margin.left + (chart.points.length === 1 ? plotWidth / 2 : (index / (chart.points.length - 1)) * plotWidth);
      const y = margin.top + plotHeight - ((point.y - domainMin) / domainSpan) * plotHeight;
      return { ...point, svgX: x, svgY: y };
    });

    const ticks = [0, 0.5, 1].map((ratio) => {
      const rawValue = domainMax - ratio * domainSpan;
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
  const segments = buildSegments(geometry.points, chart.chart_type);

  return (
    <div className="mini-chart">
      <div className="mini-chart-axis mini-chart-axis-y">{chart.y_axis_label}</div>
      <svg
        className="sparkline"
        viewBox={`0 0 ${width} ${height}`}
        onMouseLeave={() => setActiveIndex(defaultIndex)}
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

        {segments.map((segment, index) => (
          <line
            key={`${segment.x1}-${segment.y1}-${segment.x2}-${segment.y2}-${index}`}
            x1={segment.x1}
            y1={segment.y1}
            x2={segment.x2}
            y2={segment.y2}
            className={
              segment.trend === "up"
                ? "sparkline-segment sparkline-segment-up"
                : segment.trend === "down"
                  ? "sparkline-segment sparkline-segment-down"
                  : "sparkline-segment sparkline-segment-flat"
            }
          />
        ))}

        {geometry.points.map((point, index) => (
          <circle
            key={`${point.x}-${point.tick_label}`}
            cx={point.svgX}
            cy={point.svgY}
            r={activeIndex === index ? 4.5 : 3}
            className={activeIndex === index ? "chart-point chart-point-active" : "chart-point"}
            onMouseEnter={() => setActiveIndex(index)}
            onFocus={() => setActiveIndex(index)}
            onBlur={() => setActiveIndex(defaultIndex)}
            tabIndex={0}
          />
        ))}
      </svg>
      <div className="mini-chart-axis mini-chart-axis-x">{chart.x_axis_label}</div>
      <div className="mini-chart-panel" role="note" aria-live="polite">
        {activePoint ? (
          <>
            <div className="mini-chart-panel-period">{activePoint.tooltip_title}</div>
            <div className="mini-chart-panel-value">{activePoint.tooltip_value_text}</div>
          </>
        ) : (
          <>
            <div className="mini-chart-panel-period">滑鼠移到圖上查看數值</div>
            <div className="mini-chart-panel-value">-</div>
          </>
        )}
      </div>
    </div>
  );
}

function buildSegments(
  points: Array<{ svgX: number; svgY: number; y: number }>,
  chartType: UIChart["chart_type"]
): Array<{ x1: number; y1: number; x2: number; y2: number; trend: "up" | "down" | "flat" }> {
  const segments: Array<{ x1: number; y1: number; x2: number; y2: number; trend: "up" | "down" | "flat" }> = [];

  for (let index = 1; index < points.length; index += 1) {
    const point = points[index];
    const previous = points[index - 1];
    const trend = point.y > previous.y ? "up" : point.y < previous.y ? "down" : "flat";

    if (chartType === "step_after") {
      segments.push({ x1: previous.svgX, y1: previous.svgY, x2: point.svgX, y2: previous.svgY, trend });
      segments.push({ x1: point.svgX, y1: previous.svgY, x2: point.svgX, y2: point.svgY, trend });
      continue;
    }

    segments.push({ x1: previous.svgX, y1: previous.svgY, x2: point.svgX, y2: point.svgY, trend });
  }

  return segments;
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
