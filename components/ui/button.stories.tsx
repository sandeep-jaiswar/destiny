import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';

/**
 * Button component from shadcn/ui with multiple variants and sizes.
 * Used throughout the Destiny trading platform for user interactions.
 */
const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
      description: 'Visual style variant of the button',
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
      description: 'Size of the button',
    },
    asChild: {
      control: 'boolean',
      description: 'Use as a child component with Slot',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the button',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default button style with primary color
 */
export const Default: Story = {
  args: {
    children: 'Fetch Quote',
    variant: 'default',
    size: 'default',
  },
};

/**
 * Destructive button for dangerous actions
 */
export const Destructive: Story = {
  args: {
    children: 'Delete Watchlist',
    variant: 'destructive',
  },
};

/**
 * Outline button with transparent background
 */
export const Outline: Story = {
  args: {
    children: 'View Details',
    variant: 'outline',
  },
};

/**
 * Secondary button style
 */
export const Secondary: Story = {
  args: {
    children: 'Cancel',
    variant: 'secondary',
  },
};

/**
 * Ghost button with minimal styling
 */
export const Ghost: Story = {
  args: {
    children: 'Settings',
    variant: 'ghost',
  },
};

/**
 * Link-styled button
 */
export const Link: Story = {
  args: {
    children: 'Learn More',
    variant: 'link',
  },
};

/**
 * Small size button
 */
export const Small: Story = {
  args: {
    children: 'Add to Watchlist',
    size: 'sm',
  },
};

/**
 * Large size button
 */
export const Large: Story = {
  args: {
    children: 'Execute Trade',
    size: 'lg',
  },
};

/**
 * Icon-sized button
 */
export const Icon: Story = {
  args: {
    children: '📈',
    size: 'icon',
  },
};

/**
 * Disabled button state
 */
export const Disabled: Story = {
  args: {
    children: 'Loading...',
    disabled: true,
  },
};

/**
 * Example of multiple buttons in a trading interface
 */
export const TradingActions: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="default">Fetch Quote</Button>
      <Button variant="default">Fetch Historical</Button>
      <Button variant="default">Analyze Strategy</Button>
      <Button variant="secondary">Reset</Button>
    </div>
  ),
};
