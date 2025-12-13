'use client';

import { TVChartContainer } from "../../components/TVChartContainer";
import { useGetChartDataQuery, useSelectedTicker } from "@/store";

export function ChartClient() {
  const selectedTicker = useSelectedTicker() || 'AAPL';
  const { data: chartData, isLoading, isError } = useGetChartDataQuery({
    symbol: selectedTicker.toUpperCase(),
    period1: '2023-01-01',
    period2: '2024-01-01',
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
              <span className="sr-only">Loading...</span>
            </div>
            <p className="mt-4 text-gray-600">Loading chart data for {selectedTicker.toUpperCase()}...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <h2 className="font-bold text-lg">Error Loading Chart</h2>
          <p>Failed to load chart data for {selectedTicker.toUpperCase()}. Please try again later.</p>
        </div>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="container mx-auto p-8">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          <h2 className="font-bold text-lg">No Data Available</h2>
          <p>No chart data available for {selectedTicker.toUpperCase()}.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <TVChartContainer data={chartData} />
    </div>
  );
}
