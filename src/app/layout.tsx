import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Minimi Web Search Agent',
  description: 'Grounded Web Search Chat Agent with Deterministic Temporal Anchoring and Episodic Memory',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased h-screen overflow-hidden bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
        {children}
      </body>
    </html>
  );
}

