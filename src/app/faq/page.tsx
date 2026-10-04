import Link from 'next/link';
import JourneyShell from '@/components/journey-shell';

export const metadata={title:'Frequently asked questions | Dreamscape Treks',description:'Answers about planning, dates, availability and tailored journeys with Dreamscape Treks.'};

const questions=[
  {question:'Can I choose my own travel dates?',answer:'Yes. Tell us your preferred start date through the journey inquiry form. The team will discuss a private or tailored plan with you.'},
  {question:'What does “seats available” mean?',answer:'It is the number of places currently shown as open on a scheduled departure. Send a request to the team to confirm availability; a request alone does not reserve a seat.'},
  {question:'Can I change the itinerary?',answer:'Yes. Choose a journey as a starting point and describe the route, pace, group size or interests you would like to change. The team will review what is practical.'},
  {question:'Are sample journeys and dates confirmed?',answer:'No. Preview routes and example dates are for exploring the design. The team confirms the route, dates, availability and price before any booking.'},
  {question:'Where can I read the booking and cancellation terms?',answer:'The current booking and cancellation pages are linked below. Please check their draft status and confirm the latest terms with the team before making travel plans.'},
];

export default function Page(){return <JourneyShell page="faq"><section className="container section faq-page"><p className="eyebrow">PLAN WITH CONFIDENCE</p><h1>Frequently asked questions.</h1><p className="faq-intro">A few answers to help you begin. For route-specific advice, ask the team directly.</p><div className="faq-list">{questions.map(({question,answer})=><details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div><div className="button-row"><Link className="button green" href="/tailor-made">Plan a tailored journey ↗︎</Link><Link className="button outline-dark" href="/contact">Plan my journey ↗︎</Link></div><p className="faq-policies"><Link href="/policies/booking-policy">Booking policy</Link> · <Link href="/policies/cancellation-refund-policy">Cancellation and refunds</Link></p></section></JourneyShell>}
