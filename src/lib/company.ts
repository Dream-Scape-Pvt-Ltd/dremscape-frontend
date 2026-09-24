// Public contact details, overridable for deployment.
import location from '@/content/company-location.json';
const whatsapp=process.env.NEXT_PUBLIC_COMPANY_WHATSAPP || '+977 9761424745';
const digits=whatsapp.replace(/\D/g,'');
export const company={
  name:'Dreamscape Treks',
  email:process.env.NEXT_PUBLIC_COMPANY_EMAIL || 'dreamscapetrek@gmail.com',
  whatsapp:/^\d{8,15}$/.test(digits)?whatsapp:'',
  whatsappUrl:/^\d{8,15}$/.test(digits)?`https://wa.me/${digits}`:'',
  location:process.env.NEXT_PUBLIC_COMPANY_LOCATION || location.city,
  area:process.env.NEXT_PUBLIC_COMPANY_AREA || location.area,
  address:process.env.NEXT_PUBLIC_COMPANY_ADDRESS || location.address,
  mapQuery:process.env.NEXT_PUBLIC_COMPANY_MAP_QUERY || location.mapQuery,
  directionsNote:process.env.NEXT_PUBLIC_COMPANY_DIRECTIONS_NOTE ?? location.directionsNote,
};
