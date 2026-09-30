import Link from 'next/link';
import FooterLandscape from './footer-landscape';
import {asset} from '@/lib/assets';
import {company} from '@/lib/company';

export default function SiteFooter(){
  return <>
    <section className="organization-badges" aria-labelledby="organization-badges-title">
      <div className="container">
        <div className="organization-badges-heading"><p className="eyebrow">NEPAL · TOURISM & CONSERVATION</p><h2 id="organization-badges-title">Organizations across Nepal’s tourism landscape.</h2></div>
        <div className="organization-badges-grid">
          <div className="organization-badge"><img className="organization-logo organization-logo-dot" src="/images/organizations/department-of-tourism-emblem.png" alt="Government of Nepal emblem"/><span><strong>Department of Tourism</strong><small>Government of Nepal</small></span></div>
          <div className="organization-badge"><img className="organization-logo" src="/images/organizations/ntb.jpg" alt="Nepal Tourism Board logo"/><span><strong>Nepal Tourism Board</strong><small>Tourism promotion</small></span></div>
          <div className="organization-badge"><img className="organization-logo organization-logo-nma" src="/images/organizations/nma.png" alt="Nepal Mountaineering Association logo"/><span><strong>Nepal Mountaineering Association</strong><small>Mountaineering</small></span></div>
          <div className="organization-badge"><img className="organization-logo organization-logo-keep" src="/images/organizations/keep.png" alt="Kathmandu Environmental Education Project logo"/><span><strong>Kathmandu Environmental Education Project</strong><small>Environment & education</small></span></div>
          <div className="organization-badge"><img className="organization-logo organization-logo-taan" src="/images/organizations/taan.jpg" alt="Trekking Agencies’ Association of Nepal logo"/><span><strong>Trekking Agencies’ Association of Nepal</strong><small>Trekking industry</small></span></div>
        </div>
      </div>
    </section>
    <FooterLandscape/>
    <footer className="complete-footer">
      <div className="container">
        <div className="complete-footer-grid">
          <div className="footer-brand-contact">
            <Link href="/"><img src={asset('222-541-imgDreamscapeTreks')} className="footer-logo" alt="Dreamscape Treks" width="130" height="45"/></Link>
            <span className="footer-signature">View in the Horizon.</span>
            <a href={`mailto:${company.email}`}>{company.email}</a>
            <p>{company.address}</p>
          </div>
          <nav aria-label="Explore Dreamscape"><h3>Explore</h3><Link href="/treks?kind=treks">Treks</Link><Link href="/treks?kind=tours">Tours</Link><Link href="/departures">Departures</Link><Link href="/blog">Journal</Link></nav>
          <nav aria-label="Beyond Nepal"><h3>Beyond Nepal</h3><Link href="/destinations/bhutan">Bhutan</Link><Link href="/destinations/tibet">Tibet</Link><Link href="/destinations/india">India</Link></nav>
          <nav aria-label="About Dreamscape"><h3>Company</h3><Link href="/about">About us</Link><Link href="/guides">Our guides</Link><Link href="/reviews">Testimonials</Link><Link href="/faq">FAQs</Link><Link href="/gallery">Gallery</Link></nav>
          <nav aria-label="Plan with Dreamscape"><h3>Plan your trip</h3><Link href="/tailor-made">Tailor-made trips</Link><Link href="/contact">Contact us</Link><Link href="/partners">Travel agency partnerships</Link><Link href="/account">My journeys</Link></nav>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Dreamscape Adventure Treks Pvt. Ltd.</p>
          <nav aria-label="Legal"><Link href="/privacy-policy">Privacy</Link><Link href="/terms-conditions">Terms & Conditions</Link><details className="footer-legal-more"><summary>More policies</summary><div><Link href="/policies/booking-policy">Booking policy</Link><Link href="/policies/cancellation-refund-policy">Cancellation & refunds</Link><Link href="/policies/travel-insurance-policy">Travel insurance</Link><Link href="/policies/cookie-policy">Cookies</Link><Link href="/policies/website-terms-of-use">Website terms</Link><Link href="/policies/sustainability-policy">Sustainability</Link></div></details><button type="button" className="cookie-preferences-link" data-open-cookie-settings>Cookie preferences</button></nav>
        </div>
      </div>
    </footer>
  </>;
}
