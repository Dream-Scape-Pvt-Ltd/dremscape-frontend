import UiArrow from '@/components/ui-arrow';
import StructuredData from '@/components/structured-data';
import {absolutePublicUrl} from '@/lib/structured-data';
import {asset} from '@/lib/assets';
import Link from 'next/link';
import Image from 'next/image';
import {siteImage} from '@/lib/site-images';
import {StoryPhoto,MemoryReveal} from '@/components/trek-memories';
import {cache} from 'react';
import {notFound} from 'next/navigation';
import JourneyShell from '@/components/journey-shell';
import {PlanInvitation} from '@/components/editorial';
import {getGuide,type Guide} from '@/lib/guides';
import {BackendError} from '@/lib/backend';
import {storyHref} from '@/lib/links';
import type {Metadata} from 'next';

/** One request per render: metadata and the page share the fetched article. */
const load=cache(getGuide);
export async function storyMetadata(id:string):Promise<Metadata>{try{const g=await load(id);return {title:`${g.title} | Dreamscape Treks`,description:g.excerpt,alternates:{canonical:storyHref(g.id)}};}catch{return {title:'Journal | Dreamscape Treks'};}}

// Render a conservative Markdown subset as React text; CMS HTML is never executed.
// Inside a section the section heading is the h2, so body headings step down to h3.
function Markdown({text,nested=false}:{text:string;nested?:boolean}){
  const Heading=nested?'h3':'h2';
  return <>{text.split(/\n\s*\n/).map((block,i)=>{
    const b=block.trim();
    if(!b)return null;
    if(/^#{1,4}\s/.test(b))return <Heading key={i}>{b.replace(/^#{1,4}\s+/,'')}</Heading>;
    if(/^[-*]\s/.test(b))return <ul key={i}>{b.split('\n').map((line,j)=><li key={j}>{line.replace(/^[-*]\s+/,'')}</li>)}</ul>;
    return <p className="preserve-lines" key={i}>{b}</p>;
  })}</>;
}

const chapter=(i:number)=>String(i+1).padStart(2,'0');

function Endnote(){return <div className="article-endnote"><span>BEYOND THE HORIZON</span><Link href="/blog">More from the journal <UiArrow/></Link></div>;}

/** Sectioned posts from the blog studio: each section's text and photo side by side, alternating sides. */
function StorySections({sections}:{sections:NonNullable<Guide['sections']>}){
  const titled=sections.map((s,i)=>({title:s.title,i})).filter(s=>s.title);
  return <div className="story-sections container">
    {titled.length>1&&<nav className="story-toc" aria-label="In this story"><p className="eyebrow">IN THIS STORY</p><div>{titled.map(({title,i})=><a key={i} href={`#chapter-${i}`}><span>{chapter(i)}</span>{title}</a>)}</div></nav>}
    {sections.map((s,i)=><MemoryReveal key={i}><section id={`chapter-${i}`} className="story-section" data-flip={i%2===1||undefined} data-has-image={s.image?true:undefined}>
      <div className="story-text">
        <span className="chapter-number">{chapter(i)}</span>
        {s.title&&<h2>{s.title}</h2>}
        <Markdown text={s.body} nested/>
      </div>
      {s.image&&<figure className="story-figure">
        <Image src={s.image} alt={s.caption||s.title||''} width={1600} height={1200} sizes="(max-width: 900px) 100vw, 540px" unoptimized/>
        {s.caption&&<figcaption>{s.caption}</figcaption>}
      </figure>}
    </section></MemoryReveal>)}
    <div className="story-endnote"><Endnote/></div>
  </div>;
}

/** Older and archive posts: the reading column with a sticky "In this story" side list. */
function ClassicReading({g}:{g:Guide}){
  return <div className="article-reading container">
    <aside><p className="eyebrow">IN THIS STORY</p>{g.sections?.map((s,i)=><a key={i} href={`#chapter-${i}`}>{s.title}</a>)}<Link href="/contact" className="article-aside-cta">Have a journey in mind?<br/>Let’s talk <UiArrow/></Link></aside>
    <div className="article-prose">
      {g.sections?g.sections.map((s,i)=><MemoryReveal key={i}><section id={`chapter-${i}`}><span className="chapter-number">{chapter(i)}</span><h2>{s.title}</h2><Markdown text={s.body} nested/>{g.photoIds?.[i]&&<StoryPhoto id={g.photoIds[i]}/>}</section></MemoryReveal>):<Markdown text={g.markdown||'This article’s text is not available yet.'}/>}
      <Endnote/>
    </div>
  </div>;
}

/** A journal article, shown at /blog?id=<uuid>. */
export default async function StoryPage({id}:{id:string}){
  let g:Guide;
  try{g=await load(id);}
  catch(e){if(e instanceof BackendError&&e.status===404)notFound();return <JourneyShell page="journal"><section className="utility-page container status" role="alert"><h1>This story will be back soon.</h1><Link href="/blog" className="button green">Back to the journal</Link></section></JourneyShell>;}
  const storyLayout=Boolean(g.sections?.some(s=>s.image));
  return <JourneyShell page="journal">{g.managed&&<StructuredData data={{"@context":"https://schema.org","@type":"BlogPosting",headline:g.title,description:g.excerpt,url:absolutePublicUrl(storyHref(g.id)),image:g.image?absolutePublicUrl(asset(g.image)):undefined,author:{"@type":"Organization",name:g.author||"Dreamscape Treks"},publisher:{"@type":"Organization",name:"Dreamscape Treks"}}}/>}<article className={`journal-article ${g.photoIds?"memory-article":""}`}>
    <header className="article-masthead container"><Link className="text-link" href="/blog">← The journal</Link><p className="eyebrow">{g.category}</p><h1>{g.title}</h1><p>{g.excerpt}</p><div className="article-byline"><span>{g.author||'Dreamscape journal'}</span>{g.reading&&<span>{g.reading} read</span>}</div></header>
    {g.image&&<div className="article-cover container"><Image className={g.photoIds?"memory-photo":""} src={siteImage(g.image)} alt="" width={2048} height={1536} sizes="(max-width: 1280px) 100vw, 1184px" loading="eager" fetchPriority="high" unoptimized={!g.photoIds}/>{g.photoIds&&<p className="article-photo-note">A photo story from past treks · Original photographs from the Dreamscape collection</p>}</div>}
    {storyLayout&&g.sections?<StorySections sections={g.sections}/>:<ClassicReading g={g}/>}
  </article><PlanInvitation/></JourneyShell>;
}
