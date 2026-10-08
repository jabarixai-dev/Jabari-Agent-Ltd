import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Jabari — Built Different',
  description: 'Jabari: founder, builder and operator. A private AI-powered revenue operating system sits behind this public hub.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
