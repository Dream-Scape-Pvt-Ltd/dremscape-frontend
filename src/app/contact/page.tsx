import JourneyShell from '@/components/journey-shell';
import InquiryForm from '@/components/inquiry-form';
import ContactChannels from '@/components/contact-channels';
import ContactMap from '@/components/contact-map';
import {asset} from '@/lib/assets';
export const metadata={title:'Plan your journey | Dreamscape Treks',description:'Contact Dreamscape Treks to discuss a Nepal journey, ask a question or request a tailored itinerary.'};
export default function Page(){return <JourneyShell page="contact"><section className="contact-intro container"><div><p className="eyebrow">FROM A FIRST HELLO TO THE HIGH HIMALAYA</p><h1>Every great journey<br/><em>starts somewhere.</em></h1><p>Tell us what’s on your mind. A dream route, a question about Nepal, or a journey you’re still imagining.</p><ContactChannels showWhatsappPlaceholder/><div className="contact-photo"><img src={asset('151-209-imgGokyoRiSacredEmeraldLakes')} alt="Turquoise lakes in the Himalaya" width="512" height="279"/><span>Beyond the Horizon.<br/><small>Dreamscape Treks · Nepal</small></span></div></div><div className="contact-form-panel"><p className="eyebrow">LET’S MAKE IT PERSONAL</p><h2>Your next chapter.</h2><InquiryForm extended/></div></section><ContactMap/></JourneyShell>;}
