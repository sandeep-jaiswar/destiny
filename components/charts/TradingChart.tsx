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

    // Clear canvas with vintage sepia background
    ctx.fillStyle = '#f4f1e8'; // Vintage paper color
    ctx.fillRect(0, 0, rect.width, rect.height);

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

    // Draw grid lines (horizontal) - vintage brown
    ctx.strokeStyle = 'rgba(139, 101, 73, 0.2)'; // Vintage sepia brown
    ctx.lineWidth = 1;
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (chartHeight / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartWidth, y);
      ctx.stroke();
    }

    // Draw vertical grid lines - vintage style
    const verticalGridCount = Math.min(8, Math.floor(data.length / 5));
    for (let i = 0; i <= verticalGridCount; i++) {
      const x = padding.left + (chartWidth / verticalGridCount) * i;
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, padding.top + chartHeight);
      ctx.stroke();
    }

    // Draw border frame - classic vintage style
    ctx.strokeStyle = '#8b6549'; // Vintage brown
    ctx.lineWidth = 2;
    ctx.strokeRect(padding.left, padding.top, chartWidth, chartHeight);

    // Draw candlesticks with vintage colors
    data.forEach((candle, index) => {
      const x = padding.left + index * candleSpacing + candleSpacing / 2;
      const isGreen = candle.close >= candle.open;

      // Calculate y positions
      const highY = padding.top + ((maxPrice - candle.high) / priceRange) * chartHeight;
      const lowY = padding.top + ((maxPrice - candle.low) / priceRange) * chartHeight;
      const openY = padding.top + ((maxPrice - candle.open) / priceRange) * chartHeight;
      const closeY = padding.top + ((maxPrice - candle.close) / priceRange) * chartHeight;

      // Draw wick with vintage colors
      ctx.strokeStyle = isGreen ? '#2d6e2d' : '#8b3232'; // Dark vintage green/red
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      // Draw body with vintage style
      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.abs(closeY - openY) || 1;
      
      if (isGreen) {
        // Hollow vintage green candle
        ctx.strokeStyle = '#2d6e2d';
        ctx.fillStyle = '#e8f5e8'; // Light vintage green
        ctx.lineWidth = 1.5;
        ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
        ctx.strokeRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
      } else {
        // Solid vintage red candle
        ctx.fillStyle = '#8b3232';
        ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
      }

      // Highlight hovered candle with vintage style
      if (hoveredIndex === index) {
        ctx.strokeStyle = 'rgba(139, 101, 73, 0.8)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x - candleWidth / 2 - 2, padding.top, candleWidth + 4, chartHeight);
      }
    });

    // Draw price labels on right - vintage font style
    ctx.fillStyle = '#5c4a3a'; // Vintage dark brown
    ctx.font = 'bold 11px Georgia, serif'; // Classic serif font
    ctx.textAlign = 'left';
    for (let i = 0; i <= gridLines; i++) {
      const price = maxPrice - (priceRange / gridLines) * i;
      const y = padding.top + (chartHeight / gridLines) * i;
      ctx.fillText(price.toFixed(2), rect.width - padding.right + 5, y + 4);
    }

    // Draw date labels on bottom - vintage style
    ctx.textAlign = 'center';
    ctx.font = 'bold 10px Georgia, serif';
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
        className="rounded-lg border-2 border-amber-900/20 shadow-lg cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
      
      {hoveredCandle && (
        <Card className="p-3 md:p-4 bg-amber-50/50 border-amber-900/20">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 md:gap-4 text-xs md:text-sm">
            <div>
              <p className="text-muted-foreground font-serif">Date</p>
              <p className="font-medium font-serif">
                {new Date(hoveredCandle.date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground font-serif">Open</p>
              <p className="font-medium font-serif">${hoveredCandle.open.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-muted-foreground font-serif">High</p>
              <p className="font-medium text-green-700 font-serif">${hoveredCandle.high.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-muted-foreground font-serif">Low</p>
              <p className="font-medium text-red-700 font-serif">${hoveredCandle.low.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-muted-foreground font-serif">Close</p>
              <p className={`font-medium font-serif ${hoveredCandle.close >= hoveredCandle.open ? 'text-green-700' : 'text-red-700'}`}>
                ${hoveredCandle.close.toFixed(2)}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
