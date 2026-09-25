import JourneyShell from '@/components/journey-shell';
import {PageHero} from '@/components/editorial';
import PartnerInquiryForm from '@/components/partner-inquiry-form';
import {company} from '@/lib/company';

export const metadata={title:'Partner with us | Dreamscape — B2B partnerships',description:'Travel agencies, agents and group organisers: you bring the travellers, Dreamscape Treks runs the journey in Nepal and the Himalaya.'};

const partners=[
  {title:'Travel agencies & tour operators',text:'Add Himalayan treks to your catalogue without building a ground team. We operate every trip under your brand relationship.'},
  {title:'Independent agents & creators',text:'Guides, travel creators and community leaders who gather small groups: refer your travellers and we handle the rest.'},
  {title:'Schools, clubs & corporate groups',text:'Expeditions, study trips, charity treks and team journeys, planned around your group’s dates and experience.'},
  {title:'International DMCs',text:'Need a reliable operator in Nepal, Tibet, Bhutan or India? We work as your local partner on the ground.'},
];

const offers=[
  {title:'Complete ground operations',text:'Licensed guides, porters, permits, lodges, transport and domestic flights, arranged and run by our own team.'},
  {title:'Fixed & tailor-made departures',text:'Join our scheduled group departures or send us a private group and we’ll shape the itinerary around it.'},
  {title:'Partner rates & commission',text:'Net rates or commission on every traveller you send us, agreed up front and paid on time.'},
  {title:'Ready-to-share material',text:'Day-by-day itineraries, route maps and photographs you can use to promote the journeys to your travellers.'},
  {title:'A dedicated contact',text:'One person who knows your business, answers quickly and keeps you updated before and during each trip.'},
  {title:'Support on the trail',text:'Our field team stays in touch with every group, so you and your travellers are never on your own.'},
];

const steps=[
  {title:'Tell us about your business',text:'Send the enquiry below. We’ll arrange a call to understand your travellers and markets.'},
  {title:'We agree terms and rates',text:'Clear partner pricing, commission and payment terms, written down before any booking.'},
  {title:'You collect the travellers',text:'Promote the journeys your way. When travellers are ready, send us the group details and dates.'},
  {title:'We plan and run the trip',text:'Permits, logistics, guides and accommodation. We operate everything on the ground in Nepal and beyond.'},
  {title:'You earn, they come home happy',text:'Your commission is settled and your travellers return with stories that bring the next group.'},
];

export default function Page(){return <JourneyShell page="partners">
  <PageHero eyebrow="PARTNER WITH DREAMSCAPE · B2B" title="You bring the travellers." accent="We take care of the journey." description="For more than twenty years we have run treks and journeys across the Himalaya. Work with us as your trusted operator on the ground: you gather your travellers, we plan and guide every step." image="/images/trek-memories/together-in-the-mountains.jpg"/>

  <nav className="container partner-index" aria-label="Partnership sections">
    <a href="#who">Who we work with</a><a href="#offer">What we offer</a><a href="#how-it-works">How it works</a><a href="#enquire" className="partner-index-cta">Become a partner ↗</a>
  </nav>

  <section id="who" className="container section partner-section">
    <p className="eyebrow">WHO WE WORK WITH</p>
    <h2>Partners who send us<br/><em>travellers.</em></h2>
    <div className="partner-grid partner-grid-4">{partners.map(item=><article key={item.title} className="partner-card"><h3>{item.title}</h3><p>{item.text}</p></article>)}</div>
  </section>

  <section id="offer" className="about-values partner-section">
    <div className="container">
      <p className="eyebrow">WHAT WE OFFER PARTNERS</p>
      <h2>Everything on the ground,<br/><em>handled.</em></h2>
      <div className="partner-grid">{offers.map((item,i)=><article key={item.title} className="partner-card partner-card-numbered"><span>{String(i+1).padStart(2,'0')}</span><h3>{item.title}</h3><p>{item.text}</p></article>)}</div>
    </div>
  </section>

  <section id="how-it-works" className="container section partner-section">
    <p className="eyebrow">HOW IT WORKS</p>
    <h2>Five simple steps<br/><em>from hello to the trail.</em></h2>
    <ol className="partner-steps">{steps.map((step,i)=><li key={step.title}><span>{String(i+1).padStart(2,'0')}</span><h3>{step.title}</h3><p>{step.text}</p></li>)}</ol>
  </section>

  <section id="enquire" className="container section partner-enquire">
    <div>
      <p className="eyebrow">PARTNERSHIP ENQUIRY</p>
      <h2>Let’s talk about<br/><em>working together.</em></h2>
      <p>Tell us a little about your business and the travellers you work with. There’s no commitment: we’ll get in touch to discuss what makes sense for you.</p>
      <div className="partner-contact">
        <p className="eyebrow">PREFER TO TALK DIRECTLY?</p>
        <a href={`mailto:${company.email}?subject=${encodeURIComponent('B2B partnership')}`}>{company.email}</a>
        {company.whatsappUrl&&<a href={company.whatsappUrl} target="_blank" rel="noopener noreferrer">WhatsApp · {company.whatsapp}</a>}
        <span>{company.location}</span>
      </div>
    </div>
    <div className="partner-form-panel"><PartnerInquiryForm/></div>
  </section>
</JourneyShell>;}
