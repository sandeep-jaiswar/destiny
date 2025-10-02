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
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Set canvas size with device pixel ratio for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Modern gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, rect.height);
    gradient.addColorStop(0, '#fdfcfa');
    gradient.addColorStop(1, '#f5f2ed');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Calculate dimensions with better padding
    const padding = { top: 25, right: 85, bottom: 45, left: 15 };
    const chartWidth = rect.width - padding.left - padding.right;
    const chartHeight = rect.height - padding.top - padding.bottom;

    // Find price range with padding
    const prices = data.flatMap(d => [d.high, d.low]);
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const priceRange = maxPrice - minPrice;
    const pricePadding = priceRange * 0.05;

    // Calculate candle width optimally
    const candleWidth = Math.max(2, Math.min(8, chartWidth / data.length - 3));
    const candleSpacing = chartWidth / data.length;

    // Draw subtle grid lines
    ctx.strokeStyle = 'rgba(139, 101, 73, 0.12)';
    ctx.lineWidth = 1;
    const gridLines = 6;
    
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (chartHeight / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartWidth, y);
      ctx.stroke();
    }

    // Vertical grid lines for time reference
    const verticalGridCount = Math.min(6, Math.floor(data.length / 5));
    for (let i = 0; i <= verticalGridCount; i++) {
      const x = padding.left + (chartWidth / verticalGridCount) * i;
      ctx.strokeStyle = 'rgba(139, 101, 73, 0.08)';
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, padding.top + chartHeight);
      ctx.stroke();
    }

    // Draw elegant border
    ctx.strokeStyle = 'rgba(139, 101, 73, 0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(padding.left, padding.top, chartWidth, chartHeight);

    // Draw candlesticks with modern styling
    data.forEach((candle, index) => {
      const x = padding.left + index * candleSpacing + candleSpacing / 2;
      const isGreen = candle.close >= candle.open;

      // Calculate y positions
      const highY = padding.top + ((maxPrice + pricePadding - candle.high) / (priceRange + pricePadding * 2)) * chartHeight;
      const lowY = padding.top + ((maxPrice + pricePadding - candle.low) / (priceRange + pricePadding * 2)) * chartHeight;
      const openY = padding.top + ((maxPrice + pricePadding - candle.open) / (priceRange + pricePadding * 2)) * chartHeight;
      const closeY = padding.top + ((maxPrice + pricePadding - candle.close) / (priceRange + pricePadding * 2)) * chartHeight;

      // Draw wick with gradient
      const wickGradient = ctx.createLinearGradient(x, highY, x, lowY);
      if (isGreen) {
        wickGradient.addColorStop(0, '#2d6e2dcc');
        wickGradient.addColorStop(1, '#2d6e2d88');
      } else {
        wickGradient.addColorStop(0, '#8b3232cc');
        wickGradient.addColorStop(1, '#8b323288');
      }
      ctx.strokeStyle = wickGradient;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      // Draw body with modern style
      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.abs(closeY - openY) || 1.5;
      
      if (isGreen) {
        // Bullish candle - subtle fill with strong border
        ctx.fillStyle = 'rgba(45, 110, 45, 0.15)';
        ctx.strokeStyle = '#2d6e2d';
        ctx.lineWidth = 2;
        ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
        ctx.strokeRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
      } else {
        // Bearish candle - solid fill
        const bodyGradient = ctx.createLinearGradient(x, bodyTop, x, bodyTop + bodyHeight);
        bodyGradient.addColorStop(0, '#a63838');
        bodyGradient.addColorStop(1, '#8b3232');
        ctx.fillStyle = bodyGradient;
        ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
      }

      // Highlight hovered candle elegantly
      if (hoveredIndex === index) {
        ctx.strokeStyle = 'rgba(139, 101, 73, 0.4)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 2]);
        ctx.strokeRect(x - candleWidth / 2 - 3, padding.top, candleWidth + 6, chartHeight);
        ctx.setLineDash([]);
      }
    });

    // Draw elegant price labels
    ctx.fillStyle = '#5c4a3a';
    ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    
    for (let i = 0; i <= gridLines; i++) {
      const price = maxPrice + pricePadding - ((priceRange + pricePadding * 2) / gridLines) * i;
      const y = padding.top + (chartHeight / gridLines) * i;
      
      // Price label background
      const text = price.toFixed(2);
      const textWidth = ctx.measureText(text).width;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillRect(rect.width - padding.right + 2, y - 8, textWidth + 8, 16);
      
      // Price label text
      ctx.fillStyle = '#5c4a3a';
      ctx.fillText(text, rect.width - padding.right + 6, y + 4);
    }

    // Draw time labels elegantly
    ctx.textAlign = 'center';
    ctx.font = 'bold 10px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    const labelInterval = Math.max(1, Math.floor(data.length / 6));
    
    data.forEach((candle, index) => {
      if (index % labelInterval === 0 || index === data.length - 1) {
        const x = padding.left + index * candleSpacing + candleSpacing / 2;
        const date = new Date(candle.date);
        const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        // Label background
        const textWidth = ctx.measureText(label).width;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(x - textWidth / 2 - 4, rect.height - padding.bottom + 8, textWidth + 8, 16);
        
        // Label text
        ctx.fillStyle = '#5c4a3a';
        ctx.fillText(label, x, rect.height - padding.bottom + 20);
      }
    });

  }, [data, hoveredIndex]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || data.length === 0) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const padding = { left: 15, right: 85 };
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
        className="rounded-lg shadow-sm cursor-crosshair transition-shadow hover:shadow-md"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
      
      {hoveredCandle && (
        <Card className="p-3 md:p-4 bg-gradient-to-br from-amber-50/80 to-stone-50/80 border-amber-200/60 shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 md:gap-4 text-xs md:text-sm">
            <div>
              <p className="text-muted-foreground font-medium mb-1">Date</p>
              <p className="font-semibold text-foreground">
                {new Date(hoveredCandle.date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground font-medium mb-1">Open</p>
              <p className="font-semibold text-foreground">${hoveredCandle.open.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-muted-foreground font-medium mb-1">High</p>
              <p className="font-semibold text-green-700">${hoveredCandle.high.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-muted-foreground font-medium mb-1">Low</p>
              <p className="font-semibold text-red-700">${hoveredCandle.low.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-muted-foreground font-medium mb-1">Close</p>
              <p className={`font-semibold ${hoveredCandle.close >= hoveredCandle.open ? 'text-green-700' : 'text-red-700'}`}>
                ${hoveredCandle.close.toFixed(2)}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
