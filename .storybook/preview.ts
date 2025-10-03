import type { Preview } from '@storybook/nextjs';
import '../app/globals.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    nextjs: {
      appDirectory: true,
    },
    backgrounds: {
      default: 'bloomberg',
      values: [
        {
          name: 'bloomberg',
          value: '#CC0000',
        },
        {
          name: 'white',
          value: '#FFFFFF',
        },
        {
          name: 'dark',
          value: '#1a1a1a',
        },
      ],
    },
  },
};

export default preview;