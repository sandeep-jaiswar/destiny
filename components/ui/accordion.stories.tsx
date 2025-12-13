import type { Meta, StoryObj } from '@storybook/react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from './accordion';

/**
 * Accordion component for collapsible content sections.
 * Used in the Destiny trading platform for organizing market data and settings.
 */
const meta = {
  title: 'UI/Accordion',
  component: Accordion,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    type: "single",
    collapsible: true,
  },
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default accordion with single item
 */
export const Default: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-[450px]">
      <AccordionItem value="item-1">
        <AccordionTrigger>What is Destiny?</AccordionTrigger>
        <AccordionContent>
          Destiny is a professional trading platform providing real-time market data,
          advanced charting, and sophisticated strategy analysis.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

/**
 * Accordion with multiple items
 */
export const Multiple: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-[450px]">
      <AccordionItem value="item-1">
        <AccordionTrigger>Market Data</AccordionTrigger>
        <AccordionContent>
          Access real-time quotes, historical data, and market statistics for stocks,
          ETFs, and other securities.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Trading Strategies</AccordionTrigger>
        <AccordionContent>
          Apply advanced trading strategies including Moving Average, RSI, MACD, and
          Bollinger Bands to identify entry and exit points.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Portfolio Management</AccordionTrigger>
        <AccordionContent>
          Track your holdings, monitor performance, and analyze your portfolio with
          comprehensive statistics and insights.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

/**
 * Accordion with market information
 */
export const MarketInfo: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-[500px]">
      <AccordionItem value="us-markets">
        <AccordionTrigger className="font-semibold">US Markets</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>S&P 500:</span>
              <span className="font-medium">4,783.45 (+0.85%)</span>
            </div>
            <div className="flex justify-between">
              <span>NASDAQ:</span>
              <span className="font-medium">15,123.78 (+1.2%)</span>
            </div>
            <div className="flex justify-between">
              <span>Dow Jones:</span>
              <span className="font-medium">37,441.22 (+0.65%)</span>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="international">
        <AccordionTrigger className="font-semibold">International Markets</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>FTSE 100:</span>
              <span className="font-medium">7,733.24 (+0.42%)</span>
            </div>
            <div className="flex justify-between">
              <span>DAX:</span>
              <span className="font-medium">16,742.89 (+0.78%)</span>
            </div>
            <div className="flex justify-between">
              <span>Nikkei 225:</span>
              <span className="font-medium">33,464.17 (-0.23%)</span>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

/**
 * Accordion for trading strategies
 */
export const StrategySettings: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-[500px]">
      <AccordionItem value="ma-strategy">
        <AccordionTrigger>Moving Average Strategy</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-3">
            <p className="text-sm">
              Identifies buy and sell signals based on moving average crossovers.
            </p>
            <div className="space-y-2">
              <div>
                <label className="text-sm font-medium">Short Period</label>
                <p className="text-xs text-muted-foreground">Default: 10 days</p>
              </div>
              <div>
                <label className="text-sm font-medium">Long Period</label>
                <p className="text-xs text-muted-foreground">Default: 20 days</p>
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="rsi-strategy">
        <AccordionTrigger>RSI Strategy</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-3">
            <p className="text-sm">
              Uses Relative Strength Index to identify overbought and oversold conditions.
            </p>
            <div className="space-y-2">
              <div>
                <label className="text-sm font-medium">Period</label>
                <p className="text-xs text-muted-foreground">Default: 14 days</p>
              </div>
              <div>
                <label className="text-sm font-medium">Oversold Level</label>
                <p className="text-xs text-muted-foreground">Default: 30</p>
              </div>
              <div>
                <label className="text-sm font-medium">Overbought Level</label>
                <p className="text-xs text-muted-foreground">Default: 70</p>
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};
