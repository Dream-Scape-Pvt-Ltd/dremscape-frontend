import Link from 'next/link';

export default function DestinationScope({beyond=false}:{beyond?:boolean}) {
  return <nav className="destination-scope" aria-label="Destination collection"><Link href="/destinations/nepal" aria-current={!beyond?'page':undefined}>Nepal</Link><Link href="/destinations/beyond-nepal" aria-current={beyond?'page':undefined}>Beyond Nepal</Link></nav>;
}
