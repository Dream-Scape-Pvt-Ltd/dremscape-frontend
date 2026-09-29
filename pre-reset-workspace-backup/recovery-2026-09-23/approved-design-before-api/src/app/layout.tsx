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
import './destination-navigation.css';
import './navigation-refinement.css';
import './experience.css';
import './apple-navigation.css';
import './travel-polish.css';
import 'photoswipe/style.css';
import './photo-experience.css';
import PageMotion from '@/components/page-motion';

export const metadata: Metadata = {
  title: 'Dreamscape Treks — Beyond the Horizon',
  description: 'Explore the sacred Himalayas of Nepal. Discover trekking journeys through Everest, Annapurna, Mustang and Manaslu with Dreamscape Treks.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}<PageMotion/></body>
    </html>
  );
}
