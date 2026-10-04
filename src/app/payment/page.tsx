import PaymentPage from '@/components/payment-page';
export const metadata={title:'Payments & next steps | Dreamscape Treks',robots:{index:false,follow:false}};
export default async function Page({searchParams}:{searchParams:Promise<{reference?:string}>}){return <PaymentPage reference={(await searchParams).reference}/>;}
