import PaymentPage from '@/components/payment-page';
export const metadata={title:'Booking details | Dreamscape Treks',robots:{index:false,follow:false}};
export default async function Page({params}:{params:Promise<{reference:string}>}){return <PaymentPage reference={(await params).reference} confirmation/>;}
