import LegalPolicyPage from '@/components/legal-policy-page';
import type {Metadata} from 'next';
export const metadata:Metadata={robots:{index:false,follow:true}};
const publishedSlugs=['booking-policy','cancellation-refund-policy','travel-insurance-policy','cookie-policy','website-terms-of-use','sustainability-policy'];
export function generateStaticParams(){return publishedSlugs.map(slug=>({slug}));}
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;return <LegalPolicyPage slug={slug}/>;}
