import type { Meta, StoryObj } from '@storybook/react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './popover';
import { Button } from './button';

/**
 * Popover component for floating content panels.
 * Used in the Destiny trading platform for contextual menus and information.
 */
const meta = {
  title: 'UI/Popover',
  component: Popover,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default popover
 */
export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open Info</Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="space-y-2">
          <h4 className="font-medium leading-none">Market Information</h4>
          <p className="text-sm text-muted-foreground">
            Real-time market data and trading statistics.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

/**
 * Stock details popover
 */
export const StockDetails: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button>AAPL Details</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold">AAPL</h4>
              <p className="text-sm text-muted-foreground">Apple Inc.</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-lg">$182.45</p>
              <p className="text-sm text-green-600">+$4.42 (+2.5%)</p>
            </div>
          </div>
          <div className="border-t pt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Open:</span>
              <span className="font-medium">$180.25</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">High:</span>
              <span className="font-medium">$183.12</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Low:</span>
              <span className="font-medium">$179.87</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Volume:</span>
              <span className="font-medium">45.2M</span>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button size="sm" className="flex-1">Add to Watchlist</Button>
            <Button size="sm" variant="outline" className="flex-1">View Chart</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

/**
 * Strategy info popover
 */
export const StrategyInfo: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Strategy Info ℹ️</Button>
      </PopoverTrigger>
      <PopoverContent className="w-96">
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold mb-1">Moving Average Crossover</h4>
            <p className="text-sm text-muted-foreground">
              A popular technical analysis strategy that identifies buy and sell signals
              when short-term and long-term moving averages cross.
            </p>
          </div>
          <div className="border-t pt-3 space-y-2">
            <h5 className="text-sm font-medium">Current Settings:</h5>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Short Period:</span>
                <span className="font-medium">10 days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Long Period:</span>
                <span className="font-medium">20 days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Confidence:</span>
                <span className="font-medium">75%</span>
              </div>
            </div>
          </div>
          <Button size="sm" className="w-full">Edit Settings</Button>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

/**
 * Quick actions popover
 */
export const QuickActions: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost">Actions ⋮</Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2">
        <div className="flex flex-col gap-1">
          <Button variant="ghost" size="sm" className="justify-start">
            Add to Watchlist
          </Button>
          <Button variant="ghost" size="sm" className="justify-start">
            View Details
          </Button>
          <Button variant="ghost" size="sm" className="justify-start">
            Set Alert
          </Button>
          <Button variant="ghost" size="sm" className="justify-start">
            Compare
          </Button>
          <div className="border-t my-1"></div>
          <Button variant="ghost" size="sm" className="justify-start text-destructive">
            Remove
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

/**
 * Alert settings popover
 */
export const AlertSettings: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button>Set Price Alert</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Price Alert for AAPL</h4>
            <p className="text-sm text-muted-foreground">
              Get notified when the price reaches your target.
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Alert when price reaches:
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                className="flex-1 h-9 rounded-md border px-3"
                placeholder="185.00"
                step="0.01"
              />
              <select className="h-9 rounded-md border px-3">
                <option>Above</option>
                <option>Below</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="flex-1">Cancel</Button>
            <Button size="sm" className="flex-1">Set Alert</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};
