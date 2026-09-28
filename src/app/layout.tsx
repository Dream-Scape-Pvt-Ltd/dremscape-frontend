import StructuredData from '@/components/structured-data';
import {publicSiteUrl} from '@/lib/structured-data';
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
import './destination-navigation.css';
import './navigation-refinement.css';
import './experience.css';
import './apple-navigation.css';
import './travel-polish.css';
import 'photoswipe/style.css';
import './photo-experience.css';
import './final-polish.css';
import './brand-correction.css';
import './connection-status.css';
import PageMotion from '@/components/page-motion';
import BackendStatus from '@/components/backend-status';
import {AuthProvider} from '@/context/AuthContext';

export const metadata: Metadata = {
  metadataBase:new URL(publicSiteUrl()),
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
      <body>
        <StructuredData data={{"@context":"https://schema.org","@type":"TravelAgency",name:"Dreamscape Treks",url:publicSiteUrl()}}/><AuthProvider>{children}<PageMotion/><BackendStatus/></AuthProvider>
      </body>
    </html>
  );
}

import './home-refresh.css';
import './trek-detail.css';
import './destination-gallery.css';
import './site-updates.css';
import './guides.css';
import './discovery-navigation.css';
import './departures.css';
import './homepage-discovery.css';

import './trip-experience.css';

import './visual-repair.css';
