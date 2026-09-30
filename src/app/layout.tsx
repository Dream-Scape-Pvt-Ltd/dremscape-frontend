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
import CookieConsent from '@/components/cookie-consent';
import './cookie-consent.css';
import {AuthProvider} from '@/context/AuthContext';
import {NavigationProvider} from '@/components/navigation-context';
import {getNavigation} from '@/lib/menu-items-server';
import {getPublicSiteSettings} from '@/lib/site-settings';
import {contactFields} from '@/lib/company';

export const metadata: Metadata = {
  metadataBase:new URL(publicSiteUrl()),
  title: 'Dreamscape Treks — Beyond the Horizon',
  description: 'Explore the sacred Himalayas of Nepal. Discover trekking journeys through Everest, Annapurna, Mustang and Manaslu with Dreamscape Treks.',
  openGraph:{type:'website',siteName:'Dreamscape Treks',title:'Dreamscape Treks — Beyond the Horizon',description:'Explore trekking journeys across Nepal with Dreamscape Treks.',images:[{url:'/opengraph-image',width:1200,height:630,alt:'Dreamscape Treks — Beyond the Horizon'}]},
  twitter:{card:'summary_large_image',title:'Dreamscape Treks — Beyond the Horizon',description:'Explore trekking journeys across Nepal with Dreamscape Treks.',images:['/opengraph-image']},
  manifest: '/site.webmanifest',
  appleWebApp: {capable: true, title: 'Dreamscape', statusBarStyle: 'black-translucent'},
  icons: {
    icon: [
      {url: '/icons/dreamscape-mark.svg', type: 'image/svg+xml'},
      {url: '/icons/dreamscape-192.png', sizes: '192x192', type: 'image/png'},
    ],
    apple: [{url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png'}],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [menus,settings]=await Promise.all([getNavigation(),getPublicSiteSettings()]);
  const chrome={menus,contact:contactFields(settings)};
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <StructuredData data={{"@context":"https://schema.org","@type":"TravelAgency",name:"Dreamscape Treks",url:publicSiteUrl()}}/><AuthProvider><NavigationProvider chrome={chrome}>{children}<PageMotion/><BackendStatus/></NavigationProvider></AuthProvider><CookieConsent/>
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
import './trek-page.css';

import './trip-experience.css';

import './visual-repair.css';
import './trek-snapshot.css';
import './itinerary-refresh.css';
// Final catalog and landscape rules live after legacy global styles.
import './experience-tune.css';
