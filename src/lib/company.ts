// Public contact details. WhatsApp is enabled only after the company supplies a number.
const whatsapp=process.env.NEXT_PUBLIC_COMPANY_WHATSAPP || '';
const digits=whatsapp.replace(/\D/g,'');
export const company={
  name:'Dreamscape Treks',
  email:process.env.NEXT_PUBLIC_COMPANY_EMAIL || 'dreamscapetrek@gmail.com',
  whatsapp:/^\d{8,15}$/.test(digits)?whatsapp:'',
  whatsappUrl:/^\d{8,15}$/.test(digits)?`https://wa.me/${digits}`:'',
  location:'Kathmandu, Nepal',
};
