import Image from 'next/image';

export default function FooterLandscape({compact=false}:{compact?:boolean}){return <div className={`footer-landscape${compact?' footer-landscape-compact':''}`} aria-hidden="true"><Image src="/images/dreamscape-landscape-final.svg" alt="" width={4095} height={1624} sizes="100vw" unoptimized/></div>;}
