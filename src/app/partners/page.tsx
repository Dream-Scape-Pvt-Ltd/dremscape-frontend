import JourneyShell from '@/components/journey-shell';
import {PageHero} from '@/components/editorial';
import PartnerInquiryForm from '@/components/partner-inquiry-form';
import {getSiteSettings} from '@/lib/site-settings';
import {companyFrom,contactFields} from '@/lib/company';

export const metadata={title:'Partner with us | Dreamscape Treks',description:'Travel agencies, agents and group organisers: you bring the travellers, Dreamscape Treks runs the journey in Nepal and the Himalaya.'};

export default async function Page(){const settings=await getSiteSettings();const content=settings.partner_content;const company=companyFrom(contactFields(settings)); const {partners,offers,steps}=content; return <JourneyShell page="partners">
  <PageHero eyebrow="TRAVEL AGENCY PARTNERSHIPS" title={content.title} accent={content.accent} description={content.description} image={content.image}/>

  <nav className="container partner-index" aria-label="Partnership sections">
    <a className="text-link" href="/partners/portal">Partner dashboard ↗︎</a><a href="#who">Who we work with</a><a href="#offer">What we offer</a><a href="#how-it-works">How it works</a><a href="#enquire" className="partner-index-cta">Become a partner ↗︎</a>
  </nav>

  <section id="who" className="container section partner-section">
    <p className="eyebrow">WHO WE WORK WITH</p>
    <h2>{content.who_title}</h2>
    <div className="partner-grid partner-grid-4">{partners.map(item=><article key={item.title} className="partner-card"><h3>{item.title}</h3><p>{item.text}</p></article>)}</div>
  </section>

  <section id="offer" className="about-values partner-section">
    <div className="container">
      <p className="eyebrow">WHAT WE OFFER PARTNERS</p>
      <h2>{content.offer_title}</h2>
      <div className="partner-grid">{offers.map((item,i)=><article key={item.title} className="partner-card partner-card-numbered"><span>{String(i+1).padStart(2,'0')}</span><h3>{item.title}</h3><p>{item.text}</p></article>)}</div>
    </div>
  </section>

  <section id="how-it-works" className="container section partner-section">
    <p className="eyebrow">HOW IT WORKS</p>
    <h2>{content.steps_title}</h2>
    <ol className="partner-steps">{steps.map((step,i)=><li key={step.title}><span>{String(i+1).padStart(2,'0')}</span><h3>{step.title}</h3><p>{step.text}</p></li>)}</ol>
  </section>

  <section id="enquire" className="container section partner-enquire">
    <div>
      <p className="eyebrow">PARTNERSHIP ENQUIRY</p>
      <h2>{content.enquiry_title}</h2>
      <p>{content.enquiry_description}</p>
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
