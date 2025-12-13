import type { Meta, StoryObj } from '@storybook/react';
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
} from './command';
import { useState } from 'react';
import { Button } from './button';

/**
 * Command component for keyboard-accessible search and navigation.
 * Used in the Destiny trading platform for quick stock search and command palette.
 */
const meta = {
  title: 'UI/Command',
  component: Command,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Command>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic command palette
 */
export const Default: Story = {
  render: () => (
    <Command className="rounded-lg border shadow-md w-[450px]">
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>
            <span>View Dashboard</span>
          </CommandItem>
          <CommandItem>
            <span>View Watchlist</span>
          </CommandItem>
          <CommandItem>
            <span>View Portfolio</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
};

/**
 * Stock search command
 */
export const StockSearch: Story = {
  render: () => (
    <Command className="rounded-lg border shadow-md w-[450px]">
      <CommandInput placeholder="Search stocks..." />
      <CommandList>
        <CommandEmpty>No stocks found.</CommandEmpty>
        <CommandGroup heading="Popular Stocks">
          <CommandItem>
            <div className="flex items-center justify-between w-full">
              <div>
                <div className="font-medium">AAPL</div>
                <div className="text-xs text-muted-foreground">Apple Inc.</div>
              </div>
              <div className="text-right">
                <div className="font-medium">$182.45</div>
                <div className="text-xs text-green-600">+2.5%</div>
              </div>
            </div>
          </CommandItem>
          <CommandItem>
            <div className="flex items-center justify-between w-full">
              <div>
                <div className="font-medium">MSFT</div>
                <div className="text-xs text-muted-foreground">Microsoft Corp.</div>
              </div>
              <div className="text-right">
                <div className="font-medium">$378.91</div>
                <div className="text-xs text-green-600">+0.8%</div>
              </div>
            </div>
          </CommandItem>
          <CommandItem>
            <div className="flex items-center justify-between w-full">
              <div>
                <div className="font-medium">GOOGL</div>
                <div className="text-xs text-muted-foreground">Alphabet Inc.</div>
              </div>
              <div className="text-right">
                <div className="font-medium">$142.18</div>
                <div className="text-xs text-green-600">+0.9%</div>
              </div>
            </div>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
};

/**
 * Command with multiple groups and shortcuts
 */
export const WithShortcuts: Story = {
  render: () => (
    <Command className="rounded-lg border shadow-md w-[450px]">
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem>
            <span>Dashboard</span>
            <CommandShortcut>⌘D</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <span>Watchlist</span>
            <CommandShortcut>⌘W</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <span>Portfolio</span>
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <span>Settings</span>
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Actions">
          <CommandItem>
            <span>Add to Watchlist</span>
            <CommandShortcut>⌘A</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <span>Execute Trade</span>
            <CommandShortcut>⌘T</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <span>Run Strategy</span>
            <CommandShortcut>⌘R</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
};

/**
 * Command dialog (modal)
 */
const DialogExampleComponent = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        Open Command Palette
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={() => setOpen(false)}>
              <span>Search Stocks</span>
            </CommandItem>
            <CommandItem onSelect={() => setOpen(false)}>
              <span>View Market Overview</span>
            </CommandItem>
            <CommandItem onSelect={() => setOpen(false)}>
              <span>Run Strategy Analysis</span>
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Settings">
            <CommandItem onSelect={() => setOpen(false)}>
              <span>Preferences</span>
            </CommandItem>
            <CommandItem onSelect={() => setOpen(false)}>
              <span>API Keys</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
};

export const DialogExample: Story = {
  render: () => <DialogExampleComponent />,
};

/**
 * Trading actions command palette
 */
export const TradingActions: Story = {
  render: () => (
    <Command className="rounded-lg border shadow-md w-[500px]">
      <CommandInput placeholder="Search trading actions..." />
      <CommandList>
        <CommandEmpty>No actions found.</CommandEmpty>
        <CommandGroup heading="Market Data">
          <CommandItem>
            <span>Fetch Real-Time Quote</span>
          </CommandItem>
          <CommandItem>
            <span>Get Historical Data</span>
          </CommandItem>
          <CommandItem>
            <span>View Market Statistics</span>
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Strategies">
          <CommandItem>
            <span>Moving Average Crossover</span>
          </CommandItem>
          <CommandItem>
            <span>RSI Analysis</span>
          </CommandItem>
          <CommandItem>
            <span>MACD Signals</span>
          </CommandItem>
          <CommandItem>
            <span>Bollinger Bands</span>
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Portfolio">
          <CommandItem>
            <span>View Holdings</span>
          </CommandItem>
          <CommandItem>
            <span>Performance Analysis</span>
          </CommandItem>
          <CommandItem>
            <span>Risk Assessment</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
};
