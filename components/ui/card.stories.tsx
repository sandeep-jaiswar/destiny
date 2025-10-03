import type { Meta, StoryObj } from '@storybook/react';
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from './card';
import { Badge } from './badge';
import { Button } from './button';

/**
 * Card component for displaying grouped content.
 * Used extensively in the Destiny trading platform for quotes, charts, and settings panels.
 */
const meta = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic card with header and content
 */
export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Market Quote</CardTitle>
        <CardDescription>Real-time stock data</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          View current market prices and statistics for your selected stocks.
        </p>
      </CardContent>
    </Card>
  ),
};

/**
 * Card with all components including footer
 */
export const WithFooter: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Trading Strategy</CardTitle>
        <CardDescription>Analyze market trends</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Apply advanced trading strategies to identify entry and exit points.
        </p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button>Apply Strategy</Button>
      </CardFooter>
    </Card>
  ),
};

/**
 * Stock quote card example
 */
export const StockQuote: Story = {
  render: () => (
    <Card className="w-[400px]">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>AAPL</CardTitle>
            <CardDescription>Apple Inc.</CardDescription>
          </div>
          <Badge variant="default">+2.5%</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Price:</span>
            <span className="font-semibold">$182.45</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Change:</span>
            <span className="font-semibold text-green-600">+$4.42</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Volume:</span>
            <span className="font-semibold">45.2M</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Market Cap:</span>
            <span className="font-semibold">$2.85T</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Add to Watchlist</Button>
      </CardFooter>
    </Card>
  ),
};

/**
 * Settings panel card
 */
export const Settings: Story = {
  render: () => (
    <Card className="w-[450px]">
      <CardHeader>
        <CardTitle className="flex items-center">
          Appearance
        </CardTitle>
        <CardDescription>
          Customize the look and feel of the application
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Theme</p>
            <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline">Light</Badge>
            <Badge variant="default">Dark</Badge>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Currency</p>
            <p className="text-sm text-muted-foreground">Display currency</p>
          </div>
          <Badge variant="outline">USD</Badge>
        </div>
      </CardContent>
    </Card>
  ),
};

/**
 * Multiple cards in a grid layout
 */
export const GridLayout: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Quote Data</CardTitle>
          <CardDescription>Real-time market quote</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Current stock price and statistics
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Historical Data</CardTitle>
          <CardDescription>Past performance</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Historical price movements and trends
          </p>
        </CardContent>
      </Card>
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Strategy Analysis</CardTitle>
          <CardDescription>Advanced trading insights</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Comprehensive strategy evaluation and recommendations
          </p>
        </CardContent>
      </Card>
    </div>
  ),
};
