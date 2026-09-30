// Public contact details, overridable for deployment.
import location from '@/content/company-location.json';
const whatsapp=process.env.NEXT_PUBLIC_COMPANY_WHATSAPP || '';
const digits=whatsapp.replace(/\D/g,'');
export const company={
  name:'Dreamscape Adventure Treks Pvt. Ltd.',
  email:process.env.NEXT_PUBLIC_COMPANY_EMAIL || 'info@dreamscapetreks.com',
  registration:'32543/61/62',
  pan:'301826486',
  tourismLicense:'712/061/062',
  whatsapp:/^\d{8,15}$/.test(digits)?whatsapp:'',
  whatsappUrl:/^\d{8,15}$/.test(digits)?`https://wa.me/${digits}`:'',
  location:process.env.NEXT_PUBLIC_COMPANY_LOCATION || location.city,
  area:process.env.NEXT_PUBLIC_COMPANY_AREA || location.area,
  address:process.env.NEXT_PUBLIC_COMPANY_ADDRESS || 'Thamel, KMC-26, Kathmandu, Nepal',
  mapQuery:process.env.NEXT_PUBLIC_COMPANY_MAP_QUERY || location.mapQuery,
  directionsNote:process.env.NEXT_PUBLIC_COMPANY_DIRECTIONS_NOTE ?? location.directionsNote,
};
