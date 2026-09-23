import type { Metadata } from 'next';
import '@fontsource-variable/plus-jakarta-sans';
import './globals.css';
import './editorial.css';
import './destinations.css';
import './journeys.css';
import './pages.css';
import './memories.css';
import './refinements.css';
import './refined-ui.css';
import './ui-polish.css';
import './content-experience.css';

export const metadata: Metadata = {
  title: 'Dreamscape Treks — Beyond the Horizon',
  description: 'Explore the sacred Himalayas of Nepal. Discover trekking journeys through Everest, Annapurna, Mustang and Manaslu with Dreamscape Treks.',
};

import PageMotion from '@/components/page-motion';
import {AuthProvider} from '@/context/AuthContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <AuthProvider>{children}<PageMotion/></AuthProvider>
      </body>
    </html>
  );
}
