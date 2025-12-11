"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  ColorType,
  IChartApi,
  LineData,
  Time,
  LineSeries,
} from "lightweight-charts";
import type { ChartData } from "@/store";

interface TVChartContainerProps {
  data: ChartData;
}

export const TVChartContainer = ({ data }: TVChartContainerProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current || !data.quotes || data.quotes.length === 0)
      return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#ffffff" },
        textColor: "#333",
      },
      width: chartContainerRef.current.clientWidth,
      height: 500,
      grid: {
        vertLines: { color: "#e1e4e8" },
        horzLines: { color: "#e1e4e8" },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: "#d1d4dc",
      },
      rightPriceScale: {
        borderColor: "#d1d4dc",
      },
    });

    chartRef.current = chart;

    // Add line series using LineSeries definition from lightweight-charts v5
    const series = chart.addSeries(LineSeries, {
      color: "#2962FF",
      lineWidth: 2,
    });

    // Transform data to lightweight-charts format
    const formattedData: LineData[] = data.quotes.map((quote) => ({
      time: Math.floor(new Date(quote.date).getTime() / 1000) as Time,
      value: quote.close,
    }));

    // Sort data by time
    formattedData.sort((a, b) => (a.time as number) - (b.time as number));

    series.setData(formattedData);

    // Fit content to view
    chart.timeScale().fitContent();

    // Handle window resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [data]);

  return (
    <div className="w-full">
      <div className="mb-4">
        <h2 className="text-2xl font-bold">
          {data.meta.longName || data.meta.symbol}
        </h2>
        {data.meta.regularMarketPrice && (
          <p className="text-xl text-gray-700">
            {data.meta.currency} {data.meta.regularMarketPrice.toFixed(2)}
          </p>
        )}
      </div>
      <div ref={chartContainerRef} className="w-full" />
    </div>
  );
};
