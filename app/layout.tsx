import './globals.css';
import type { Metadata } from 'next';
import { WalletContextProvider } from '@/components/WalletProvider';

export const metadata: Metadata = {
  title: 'StairAI 新年红包 | Chinese New Year Red Packet',
  description: 'Claim your lucky red packet from StairAI! Follow us on Twitter and claim USDT rewards.',
  openGraph: {
    title: 'StairAI 新年红包',
    description: 'Claim your lucky red packet!',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <WalletContextProvider>
          {children}
        </WalletContextProvider>
      </body>
    </html>
  );
}
