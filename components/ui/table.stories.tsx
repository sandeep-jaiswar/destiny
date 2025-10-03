import type { Meta, StoryObj } from '@storybook/react';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from './table';
import { Badge } from './badge';

/**
 * Table component for displaying tabular data.
 * Used in the Destiny trading platform for watchlists, historical data, and market overviews.
 */
const meta = {
  title: 'UI/Table',
  component: Table,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic table structure
 */
export const Default: Story = {
  render: () => (
    <Table>
      <TableCaption>A list of your recent trades</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Symbol</TableHead>
          <TableHead>Action</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead className="text-right">Price</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium">AAPL</TableCell>
          <TableCell>BUY</TableCell>
          <TableCell>100</TableCell>
          <TableCell className="text-right">$182.45</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">TSLA</TableCell>
          <TableCell>SELL</TableCell>
          <TableCell>50</TableCell>
          <TableCell className="text-right">$248.32</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">GOOGL</TableCell>
          <TableCell>BUY</TableCell>
          <TableCell>25</TableCell>
          <TableCell className="text-right">$142.18</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

/**
 * Watchlist table with real-time data
 */
export const Watchlist: Story = {
  render: () => (
    <div className="w-[800px]">
      <Table>
        <TableCaption>Your stock watchlist</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Symbol</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Change</TableHead>
            <TableHead className="text-right">Change %</TableHead>
            <TableHead className="text-right">Volume</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">AAPL</TableCell>
            <TableCell>Apple Inc.</TableCell>
            <TableCell className="text-right">$182.45</TableCell>
            <TableCell className="text-right text-green-600">+$4.42</TableCell>
            <TableCell className="text-right">
              <Badge variant="default">+2.5%</Badge>
            </TableCell>
            <TableCell className="text-right">45.2M</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">MSFT</TableCell>
            <TableCell>Microsoft Corporation</TableCell>
            <TableCell className="text-right">$378.91</TableCell>
            <TableCell className="text-right text-green-600">+$2.87</TableCell>
            <TableCell className="text-right">
              <Badge variant="default">+0.8%</Badge>
            </TableCell>
            <TableCell className="text-right">22.8M</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">GOOGL</TableCell>
            <TableCell>Alphabet Inc.</TableCell>
            <TableCell className="text-right">$142.18</TableCell>
            <TableCell className="text-right text-green-600">+$1.23</TableCell>
            <TableCell className="text-right">
              <Badge variant="default">+0.9%</Badge>
            </TableCell>
            <TableCell className="text-right">18.5M</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">TSLA</TableCell>
            <TableCell>Tesla, Inc.</TableCell>
            <TableCell className="text-right">$248.32</TableCell>
            <TableCell className="text-right text-red-600">-$3.21</TableCell>
            <TableCell className="text-right">
              <Badge variant="destructive">-1.3%</Badge>
            </TableCell>
            <TableCell className="text-right">112.4M</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">NVDA</TableCell>
            <TableCell>NVIDIA Corporation</TableCell>
            <TableCell className="text-right">$487.53</TableCell>
            <TableCell className="text-right text-green-600">+$12.45</TableCell>
            <TableCell className="text-right">
              <Badge variant="default">+2.6%</Badge>
            </TableCell>
            <TableCell className="text-right">38.9M</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  ),
};

/**
 * Table with footer showing totals
 */
export const WithFooter: Story = {
  render: () => (
    <div className="w-[600px]">
      <Table>
        <TableCaption>Portfolio holdings summary</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Symbol</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead className="text-right">Avg Price</TableHead>
            <TableHead className="text-right">Market Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">AAPL</TableCell>
            <TableCell className="text-right">100</TableCell>
            <TableCell className="text-right">$178.00</TableCell>
            <TableCell className="text-right">$18,245</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">MSFT</TableCell>
            <TableCell className="text-right">50</TableCell>
            <TableCell className="text-right">$372.00</TableCell>
            <TableCell className="text-right">$18,946</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">GOOGL</TableCell>
            <TableCell className="text-right">75</TableCell>
            <TableCell className="text-right">$138.50</TableCell>
            <TableCell className="text-right">$10,664</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3} className="font-bold">Total Portfolio Value</TableCell>
            <TableCell className="text-right font-bold">$47,855</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  ),
};

/**
 * Compact table for mobile or sidebar display
 */
export const Compact: Story = {
  render: () => (
    <div className="w-[400px]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Symbol</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Change</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">AAPL</TableCell>
            <TableCell className="text-right">$182.45</TableCell>
            <TableCell className="text-right text-green-600">+2.5%</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">MSFT</TableCell>
            <TableCell className="text-right">$378.91</TableCell>
            <TableCell className="text-right text-green-600">+0.8%</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">TSLA</TableCell>
            <TableCell className="text-right">$248.32</TableCell>
            <TableCell className="text-right text-red-600">-1.3%</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  ),
};
