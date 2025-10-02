import localFont from 'next/font/local';

// Inter font - Professional UI font for trading interface
export const inter = localFont({
  src: [
    {
      path: '../assets/fonts/inter/ttf/inter-latin-300-normal.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../assets/fonts/inter/ttf/inter-latin-300-italic.ttf',
      weight: '300',
      style: 'italic',
    },
    {
      path: '../assets/fonts/inter/ttf/inter-latin-400-normal.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../assets/fonts/inter/ttf/inter-latin-400-italic.ttf',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../assets/fonts/inter/ttf/inter-latin-500-normal.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../assets/fonts/inter/ttf/inter-latin-500-italic.ttf',
      weight: '500',
      style: 'italic',
    },
    {
      path: '../assets/fonts/inter/ttf/inter-latin-600-normal.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../assets/fonts/inter/ttf/inter-latin-600-italic.ttf',
      weight: '600',
      style: 'italic',
    },
    {
      path: '../assets/fonts/inter/ttf/inter-latin-700-normal.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../assets/fonts/inter/ttf/inter-latin-700-italic.ttf',
      weight: '700',
      style: 'italic',
    },
  ],
  variable: '--font-inter',
  display: 'swap',
  fallback: [
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif'
  ],
});

// JetBrains Mono font - Monospace font for financial data and code
export const jetbrainsMono = localFont({
  src: [
    {
      path: '../assets/fonts/jetbrainsmono/fonts/ttf/JetBrainsMono-Light.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../assets/fonts/jetbrainsmono/fonts/ttf/JetBrainsMono-LightItalic.ttf',
      weight: '300',
      style: 'italic',
    },
    {
      path: '../assets/fonts/jetbrainsmono/fonts/ttf/JetBrainsMono-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../assets/fonts/jetbrainsmono/fonts/ttf/JetBrainsMono-Italic.ttf',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../assets/fonts/jetbrainsmono/fonts/ttf/JetBrainsMono-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../assets/fonts/jetbrainsmono/fonts/ttf/JetBrainsMono-MediumItalic.ttf',
      weight: '500',
      style: 'italic',
    },
    {
      path: '../assets/fonts/jetbrainsmono/fonts/ttf/JetBrainsMono-SemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../assets/fonts/jetbrainsmono/fonts/ttf/JetBrainsMono-SemiBoldItalic.ttf',
      weight: '600',
      style: 'italic',
    },
    {
      path: '../assets/fonts/jetbrainsmono/fonts/ttf/JetBrainsMono-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../assets/fonts/jetbrainsmono/fonts/ttf/JetBrainsMono-BoldItalic.ttf',
      weight: '700',
      style: 'italic',
    },
  ],
  variable: '--font-jetbrains-mono',
  display: 'swap',
  fallback: [
    '"SF Mono"',
    'Monaco',
    'Menlo',
    'Consolas',
    '"Courier New"',
    'monospace'
  ],
});
