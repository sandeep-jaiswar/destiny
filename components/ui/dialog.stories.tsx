import type { Meta, StoryObj } from '@storybook/react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';
import { Button } from './button';
import { Input } from './input';

/**
 * Dialog component for modal dialogs and overlays.
 * Used in the Destiny trading platform for confirmations, forms, and detailed views.
 */
const meta = {
  title: 'UI/Dialog',
  component: Dialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic dialog with title and description
 */
export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Market Alert</DialogTitle>
          <DialogDescription>
            Your stock alert has been triggered. AAPL has reached $185.00.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  ),
};

/**
 * Dialog with footer buttons
 */
export const WithFooter: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Confirm Trade</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Your Order</DialogTitle>
          <DialogDescription>
            Are you sure you want to place this order?
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-4">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Symbol:</span>
            <span className="text-sm font-medium">AAPL</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Quantity:</span>
            <span className="text-sm font-medium">100 shares</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Price:</span>
            <span className="text-sm font-medium">$182.50</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="text-sm font-semibold">Total:</span>
            <span className="text-sm font-semibold">$18,250.00</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button>Confirm Order</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

/**
 * Dialog with form for adding to watchlist
 */
export const WatchlistForm: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add to Watchlist</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Stock to Watchlist</DialogTitle>
          <DialogDescription>
            Enter the stock symbol you want to track.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="symbol" className="text-sm font-medium">
              Stock Symbol
            </label>
            <Input
              id="symbol"
              placeholder="e.g., AAPL, MSFT, GOOGL"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="alert-price" className="text-sm font-medium">
              Alert Price (Optional)
            </label>
            <Input
              id="alert-price"
              type="number"
              placeholder="0.00"
              step="0.01"
            />
            <p className="text-xs text-muted-foreground">
              Get notified when the stock reaches this price
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button>Add to Watchlist</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

/**
 * Strategy settings dialog
 */
export const StrategySettings: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Strategy Settings</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Moving Average Strategy</DialogTitle>
          <DialogDescription>
            Configure parameters for the Moving Average Crossover strategy.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="short-period" className="text-sm font-medium">
              Short Period (days)
            </label>
            <Input
              id="short-period"
              type="number"
              defaultValue="10"
              min="1"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="long-period" className="text-sm font-medium">
              Long Period (days)
            </label>
            <Input
              id="long-period"
              type="number"
              defaultValue="20"
              min="1"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="confidence" className="text-sm font-medium">
              Minimum Confidence (%)
            </label>
            <Input
              id="confidence"
              type="number"
              defaultValue="70"
              min="0"
              max="100"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline">Reset to Default</Button>
          <Button>Save Settings</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

/**
 * Destructive action confirmation
 */
export const DestructiveConfirmation: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete Portfolio</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            portfolio and remove all associated data.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button variant="destructive">Delete Portfolio</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};
