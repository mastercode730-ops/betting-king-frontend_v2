import './globals.css';

export const metadata = {
  title: 'Satta King Pro — Live Superfast Results 2026 | Gali Desawar Chart',
  description: 'Superfast Live Satta King Pro Result 2026. Realtime Gali, Desawar, Ghaziabad, Faridabad draws with full monthly chart archive. Fastest satta results online.',
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon-32x32.png',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
