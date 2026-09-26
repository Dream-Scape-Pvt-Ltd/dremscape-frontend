import Link from 'next/link';
import {asset} from '@/lib/assets';
import Breadcrumbs,{type Crumb} from './breadcrumbs';
export function PageHero({eyebrow,title,accent,description,image,crumbs}:{eyebrow:string;title:string;accent?:string;description?:string;image?:string;crumbs?:Crumb[]}){return <section className={`editorial-hero ${image?'has-photo':''}`}>{image&&<img src={asset(image)} alt="" fetchPriority="high"/>}<div className="container">{crumbs&&<Breadcrumbs items={crumbs}/>}<p className="eyebrow">{eyebrow}</p><h1>{title}{accent&&<><br/><em>{accent}</em></>}</h1>{description&&<p>{description}</p>}</div></section>;}
export function PlanInvitation(){return <section className="journey-invitation container"><p className="eyebrow">BEYOND THE HORIZON</p><h2>The next story<br/><em>could be yours.</em></h2><p>Tell us what draws you to Nepal. Let’s find the journey that fits.</p><Link className="button gold" href="/contact">Start a conversation ↗</Link></section>;}
