import LegalPolicyPage from '@/components/legal-policy-page';
import type {Metadata} from 'next';
export const metadata:Metadata={title:'Terms & Conditions | Dreamscape Treks',description:'Draft travel terms and conditions supplied for company review.',robots:{index:false,follow:true}};
export default function Page(){return <LegalPolicyPage slug="terms-conditions"/>;}
