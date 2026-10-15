import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/app-shell';

export const metadata: Metadata = {
  title: 'AetherMail — Disposable Temporary Email',
  description:
    'Instant, secure disposable temporary email powered by Mail.tm with a refined Neumorphism design system.',
  openGraph: {
    title: 'AetherMail — Disposable Temporary Email',
    description:
      'Instant, secure disposable temporary email powered by Mail.tm with a refined Neumorphism design system.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AetherMail — Disposable Temporary Email',
    description:
      'Instant, secure disposable temporary email powered by Mail.tm with a refined Neumorphism design system.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
