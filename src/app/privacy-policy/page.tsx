import LegalPolicyPage from '@/components/legal-policy-page';
import type {Metadata} from 'next';
export const metadata:Metadata={title:'Privacy Policy | Dreamscape Treks',description:'How Dreamscape Treks handles personal information. Draft for company review.',robots:{index:false,follow:true}};
export default function Page(){return <LegalPolicyPage slug="privacy-policy"/>;}
