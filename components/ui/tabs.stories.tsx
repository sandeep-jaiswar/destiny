import type { Meta, StoryObj } from '@storybook/react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';

/**
 * Tabs component for organizing content into switchable panels.
 * Used in the Destiny trading platform for organizing different views and data categories.
 */
const meta = {
  title: 'UI/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic tabs example
 */
export const Default: Story = {
  render: () => (
    <Tabs defaultValue="tab1" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        <TabsTrigger value="tab3">Tab 3</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <p className="text-sm text-muted-foreground">Content for tab 1</p>
      </TabsContent>
      <TabsContent value="tab2">
        <p className="text-sm text-muted-foreground">Content for tab 2</p>
      </TabsContent>
      <TabsContent value="tab3">
        <p className="text-sm text-muted-foreground">Content for tab 3</p>
      </TabsContent>
    </Tabs>
  ),
};

/**
 * Market data tabs
 */
export const MarketData: Story = {
  render: () => (
    <Tabs defaultValue="quote" className="w-[600px]">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="quote">Quote</TabsTrigger>
        <TabsTrigger value="historical">Historical</TabsTrigger>
        <TabsTrigger value="strategy">Strategy</TabsTrigger>
      </TabsList>
      <TabsContent value="quote">
        <Card>
          <CardHeader>
            <CardTitle>Real-Time Quote</CardTitle>
            <CardDescription>Current market data for AAPL</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Price:</span>
              <span className="text-sm font-semibold">$182.45</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Change:</span>
              <span className="text-sm font-semibold text-green-600">+$4.42 (+2.5%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Volume:</span>
              <span className="text-sm font-semibold">45.2M</span>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="historical">
        <Card>
          <CardHeader>
            <CardTitle>Historical Data</CardTitle>
            <CardDescription>Past 30 days performance</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Historical price data, trends, and patterns for AAPL over the past 30 days.
              Use this data to analyze past performance and identify trends.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="strategy">
        <Card>
          <CardHeader>
            <CardTitle>Strategy Analysis</CardTitle>
            <CardDescription>Technical indicators and signals</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Advanced trading strategies including Moving Average Crossover, RSI, and MACD analysis.
              Get buy/sell recommendations based on technical indicators.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  ),
};

/**
 * Trading view tabs
 */
export const TradingView: Story = {
  render: () => (
    <Tabs defaultValue="watchlist" className="w-[700px]">
      <TabsList>
        <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
        <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
        <TabsTrigger value="orders">Orders</TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
      </TabsList>
      <TabsContent value="watchlist">
        <Card>
          <CardHeader>
            <CardTitle>My Watchlist</CardTitle>
            <CardDescription>Stocks you&apos;re tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">AAPL</p>
                  <p className="text-xs text-muted-foreground">Apple Inc.</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">$182.45</p>
                  <p className="text-xs text-green-600">+2.5%</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">MSFT</p>
                  <p className="text-xs text-muted-foreground">Microsoft Corporation</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">$378.91</p>
                  <p className="text-xs text-green-600">+0.8%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="portfolio">
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Holdings</CardTitle>
            <CardDescription>Your current positions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              View all your current stock holdings, including quantity, average price, and current value.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="orders">
        <Card>
          <CardHeader>
            <CardTitle>Active Orders</CardTitle>
            <CardDescription>Pending and executed orders</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Track your active orders, including limit orders, stop-loss orders, and recently executed trades.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="history">
        <Card>
          <CardHeader>
            <CardTitle>Trading History</CardTitle>
            <CardDescription>Past transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Review your complete trading history with detailed transaction records and performance metrics.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  ),
};

/**
 * Account settings tabs
 */
export const Settings: Story = {
  render: () => (
    <Tabs defaultValue="profile" className="w-[600px]">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="preferences">Preferences</TabsTrigger>
        <TabsTrigger value="api">API</TabsTrigger>
      </TabsList>
      <TabsContent value="profile">
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>Manage your account information</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Update your personal information, contact details, and account preferences.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="security">
        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>Manage your password and 2FA</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Configure two-factor authentication, change your password, and review login history.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="preferences">
        <Card>
          <CardHeader>
            <CardTitle>Trading Preferences</CardTitle>
            <CardDescription>Customize your trading experience</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Set default markets, currency preferences, notification settings, and chart styles.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="api">
        <Card>
          <CardHeader>
            <CardTitle>API Access</CardTitle>
            <CardDescription>Manage API keys and webhooks</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Generate API keys for programmatic access and configure webhook endpoints.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  ),
};
