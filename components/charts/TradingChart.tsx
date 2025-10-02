'use client';

import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { HistoricalDataPoint } from '@/lib/types/market';

interface TradingChartProps {
  symbol: string;
  data: HistoricalDataPoint[];
  interval: string;
  height?: number;
}

export function TradingChart({ data, height = 400 }: TradingChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Calculate dimensions
    const padding = { top: 20, right: 80, bottom: 40, left: 10 };
    const chartWidth = rect.width - padding.left - padding.right;
    const chartHeight = rect.height - padding.top - padding.bottom;

    // Find price range
    const prices = data.flatMap(d => [d.high, d.low]);
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const priceRange = maxPrice - minPrice;

    // Calculate candle width
    const candleWidth = Math.max(1, chartWidth / data.length - 2);
    const candleSpacing = chartWidth / data.length;

    // Draw grid lines (horizontal)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (chartHeight / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartWidth, y);
      ctx.stroke();
    }

    // Draw candlesticks
    data.forEach((candle, index) => {
      const x = padding.left + index * candleSpacing + candleSpacing / 2;
      const isGreen = candle.close >= candle.open;

      // Calculate y positions
      const highY = padding.top + ((maxPrice - candle.high) / priceRange) * chartHeight;
      const lowY = padding.top + ((maxPrice - candle.low) / priceRange) * chartHeight;
      const openY = padding.top + ((maxPrice - candle.open) / priceRange) * chartHeight;
      const closeY = padding.top + ((maxPrice - candle.close) / priceRange) * chartHeight;

      // Draw wick
      ctx.strokeStyle = isGreen ? '#22c55e' : '#ef4444';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      // Draw body
      ctx.fillStyle = isGreen ? '#22c55e' : '#ef4444';
      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.abs(closeY - openY) || 1;
      ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);

      // Highlight hovered candle
      if (hoveredIndex === index) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x - candleWidth / 2 - 2, padding.top, candleWidth + 4, chartHeight);
      }
    });

    // Draw price labels on right
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    for (let i = 0; i <= gridLines; i++) {
      const price = maxPrice - (priceRange / gridLines) * i;
      const y = padding.top + (chartHeight / gridLines) * i;
      ctx.fillText(price.toFixed(2), rect.width - padding.right + 5, y + 4);
    }

    // Draw date labels on bottom
    ctx.textAlign = 'center';
    const labelInterval = Math.max(1, Math.floor(data.length / 5));
    data.forEach((candle, index) => {
      if (index % labelInterval === 0) {
        const x = padding.left + index * candleSpacing + candleSpacing / 2;
        const date = new Date(candle.date);
        const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        ctx.fillText(label, x, rect.height - padding.bottom + 20);
      }
    });

  }, [data, hoveredIndex]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || data.length === 0) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const padding = { left: 10, right: 80 };
    const chartWidth = rect.width - padding.left - padding.right;
    const candleSpacing = chartWidth / data.length;

    const index = Math.floor((x - padding.left) / candleSpacing);
    if (index >= 0 && index < data.length) {
      setHoveredIndex(index);
    } else {
      setHoveredIndex(null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  const hoveredCandle = hoveredIndex !== null ? data[hoveredIndex] : null;

  return (
    <div className="space-y-2">
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: `${height}px` }}
        className="rounded-lg bg-card/50 cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
      
      {hoveredCandle && (
        <Card className="p-4">
          <div className="grid grid-cols-5 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Date</p>
              <p className="font-medium">
                {new Date(hoveredCandle.date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Open</p>
              <p className="font-medium">${hoveredCandle.open.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">High</p>
              <p className="font-medium text-green-500">${hoveredCandle.high.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Low</p>
              <p className="font-medium text-red-500">${hoveredCandle.low.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Close</p>
              <p className={`font-medium ${hoveredCandle.close >= hoveredCandle.open ? 'text-green-500' : 'text-red-500'}`}>
                ${hoveredCandle.close.toFixed(2)}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
