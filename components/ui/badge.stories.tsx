import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './badge';

/**
 * Badge component for displaying status indicators, labels, and tags.
 * Used in the Destiny trading platform for market status, price changes, and categories.
 */
const meta = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline'],
      description: 'Visual style variant of the badge',
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default badge style
 */
export const Default: Story = {
  args: {
    children: 'Active',
  },
};

/**
 * Secondary badge style
 */
export const Secondary: Story = {
  args: {
    children: 'US Stocks',
    variant: 'secondary',
  },
};

/**
 * Destructive badge for negative indicators
 */
export const Destructive: Story = {
  args: {
    children: 'Closed',
    variant: 'destructive',
  },
};

/**
 * Outline badge with transparent background
 */
export const Outline: Story = {
  args: {
    children: 'USD',
    variant: 'outline',
  },
};

/**
 * Example showing badges in a trading context
 */
export const MarketStatus: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Market Open</Badge>
      <Badge variant="secondary">NASDAQ</Badge>
      <Badge variant="outline">USD</Badge>
    </div>
  ),
};

/**
 * Example showing price change badges
 */
export const PriceChanges: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-sm">AAPL:</span>
        <Badge variant="default">+2.5%</Badge>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm">TSLA:</span>
        <Badge variant="destructive">-1.3%</Badge>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm">MSFT:</span>
        <Badge variant="secondary">+0.8%</Badge>
      </div>
    </div>
  ),
};
