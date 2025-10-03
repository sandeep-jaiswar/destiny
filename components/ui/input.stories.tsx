import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './input';

/**
 * Input component for text entry and form fields.
 * Used throughout the Destiny trading platform for symbol search, filters, and user input.
 */
const meta = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'search', 'tel', 'url'],
      description: 'Input type',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the input',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default text input
 */
export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

/**
 * Input for stock symbol search
 */
export const SymbolSearch: Story = {
  args: {
    type: 'text',
    placeholder: 'Enter symbol (e.g., AAPL, TSLA, GOOGL)',
  },
};

/**
 * Email input
 */
export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'Enter your email',
  },
};

/**
 * Password input
 */
export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter your password',
  },
};

/**
 * Number input for trade quantity
 */
export const Number: Story = {
  args: {
    type: 'number',
    placeholder: '0',
    min: 0,
  },
};

/**
 * Search input
 */
export const Search: Story = {
  args: {
    type: 'search',
    placeholder: 'Search stocks...',
  },
};

/**
 * Disabled input
 */
export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
    value: 'Cannot edit',
  },
};

/**
 * Input with label (form example)
 */
export const WithLabel: Story = {
  render: () => (
    <div className="w-[350px] space-y-2">
      <label htmlFor="symbol" className="text-sm font-medium">
        Stock Symbol
      </label>
      <Input
        id="symbol"
        type="text"
        placeholder="Enter symbol (e.g., AAPL)"
      />
      <p className="text-xs text-muted-foreground">
        Enter a valid stock symbol to fetch quote data
      </p>
    </div>
  ),
};

/**
 * Trading form example with multiple inputs
 */
export const TradingForm: Story = {
  render: () => (
    <div className="w-[400px] space-y-4">
      <div className="space-y-2">
        <label htmlFor="trade-symbol" className="text-sm font-medium">
          Symbol
        </label>
        <Input
          id="trade-symbol"
          type="text"
          placeholder="AAPL"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="trade-quantity" className="text-sm font-medium">
          Quantity
        </label>
        <Input
          id="trade-quantity"
          type="number"
          placeholder="100"
          min="1"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="trade-price" className="text-sm font-medium">
          Limit Price (USD)
        </label>
        <Input
          id="trade-price"
          type="number"
          placeholder="182.50"
          step="0.01"
          min="0"
        />
      </div>
    </div>
  ),
};
