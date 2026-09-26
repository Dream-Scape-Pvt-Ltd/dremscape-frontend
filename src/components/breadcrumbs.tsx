import Link from 'next/link';

export type Crumb={label:string;href?:string};

/** Where this page sits, with a link back up each level. The last item is the current page. */
export default function Breadcrumbs({items,tone='dark'}:{items:Crumb[];tone?:'dark'|'light'}) {
  return <nav className={`crumbs crumbs-${tone}`} aria-label="Breadcrumb"><ol>{items.map((item,i)=>{const last=i===items.length-1;return <li key={`${item.label}-${i}`}>{item.href&&!last?<Link href={item.href}>{item.label}</Link>:<span aria-current={last?'page':undefined}>{item.label}</span>}</li>;})}</ol></nav>;
}
