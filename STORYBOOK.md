# Storybook Documentation

## Overview

Storybook is set up for the Destiny trading platform to provide an interactive component library and development environment. It's configured to work seamlessly with Next.js 15, TypeScript, and Tailwind CSS.

## Getting Started

### Running Storybook

Start the Storybook development server:

```bash
npm run storybook
```

This will start Storybook on `http://localhost:6006`

### Building Storybook

Build a static version of Storybook for deployment:

```bash
npm run build-storybook
```

The static files will be generated in the `storybook-static` directory.

## Configuration

### Main Configuration (`.storybook/main.ts`)

The main configuration file sets up:
- **Stories location**: Components are located in `components/**/*.stories.@(js|jsx|mjs|ts|tsx)`
- **Framework**: Next.js integration with `@storybook/nextjs`
- **Addons**: Docs addon for automatic documentation
- **Static files**: Public directory for assets
- **Autodocs**: Automatically generates documentation from stories

### Preview Configuration (`.storybook/preview.ts`)

The preview configuration includes:
- **Global styles**: Imports `app/globals.css` to ensure Tailwind CSS and custom styles work
- **Custom backgrounds**: Bloomberg red theme (#CC0000), white, and dark backgrounds
- **Next.js App Router**: Configured for Next.js 15 App Router compatibility

## Writing Stories

### Component Story Structure

Stories follow the CSF 3.0 (Component Story Format) pattern:

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { ComponentName } from './component-name';

const meta = {
  title: 'UI/ComponentName',
  component: ComponentName,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    // Define controls for props
  },
} satisfies Meta<typeof ComponentName>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Default props
  },
};
```

### Existing Stories

The following UI components have stories:

#### Badge (`components/ui/badge.stories.tsx`)
- Default, Secondary, Destructive, Outline variants
- Trading context examples (Market Status, Price Changes)

#### Button (`components/ui/button.stories.tsx`)
- All variants: Default, Destructive, Outline, Secondary, Ghost, Link
- All sizes: Default, Small, Large, Icon
- States: Disabled
- Trading context example

#### Card (`components/ui/card.stories.tsx`)
- Basic card structure
- With footer
- Stock quote example
- Settings panel example
- Grid layout example

#### Input (`components/ui/input.stories.tsx`)
- Text, Email, Password, Number, Search inputs
- Symbol search example
- Trading form example with multiple inputs

#### Table (`components/ui/table.stories.tsx`)
- Default table
- Watchlist with real-time data simulation
- Portfolio table with footer
- Compact table for mobile/sidebar

#### Tabs (`components/ui/tabs.stories.tsx`)
- Basic tabs
- Market data tabs (Quote, Historical, Strategy)
- Trading view tabs (Watchlist, Portfolio, Orders, History)
- Settings tabs

## Best Practices

### 1. Documentation
- Use JSDoc comments above the `meta` object to describe the component
- Add descriptions to individual stories to explain their purpose
- Use descriptive story names that reflect the use case

### 2. Controls
- Define `argTypes` for important props to enable interactive controls
- Provide meaningful descriptions for each control
- Set appropriate control types (select, boolean, text, etc.)

### 3. Trading Platform Context
- Create stories that reflect real trading scenarios
- Use realistic data (stock symbols, prices, percentages)
- Show components in their intended context (e.g., watchlist tables, trading forms)

### 4. Styling
- All stories inherit Tailwind CSS and global styles
- The Bloomberg red theme (#CC0000) is the default background
- Use the background addon to test components on different backgrounds

### 5. Composition
- Show complex component compositions (e.g., Cards with Buttons and Badges)
- Demonstrate responsive layouts where applicable
- Create stories that show components working together

## Adding New Stories

To add a story for a new component:

1. Create a `.stories.tsx` file next to your component
2. Import the component and Storybook types
3. Define the meta object with title, component, and configuration
4. Export default meta
5. Create story objects for different use cases
6. Test in Storybook dev server

Example:

```typescript
// components/ui/my-component.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { MyComponent } from './my-component';

/**
 * MyComponent description
 */
const meta = {
  title: 'UI/MyComponent',
  component: MyComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MyComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // props
  },
};
```

## Deployment

Storybook can be deployed as a static site:

1. Build Storybook: `npm run build-storybook`
2. Deploy the `storybook-static` directory to any static hosting service
3. Options include: Vercel, Netlify, GitHub Pages, AWS S3, etc.

## Troubleshooting

### Styles not loading
- Ensure `app/globals.css` is imported in `.storybook/preview.ts`
- Check that Tailwind CSS is properly configured
- Verify PostCSS configuration is correct

### Components not found
- Check the `stories` pattern in `.storybook/main.ts`
- Ensure story files end with `.stories.tsx`
- Verify file paths are correct

### TypeScript errors
- Ensure `@storybook/react` types are installed
- Check that story files use proper TypeScript syntax
- Verify component props are correctly typed

## Resources

- [Storybook Documentation](https://storybook.js.org/docs)
- [Next.js Integration](https://storybook.js.org/docs/get-started/nextjs)
- [Component Story Format](https://storybook.js.org/docs/api/csf)
- [Writing Stories](https://storybook.js.org/docs/writing-stories)
- [Storybook Addons](https://storybook.js.org/docs/addons)
