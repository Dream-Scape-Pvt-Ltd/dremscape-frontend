// Public contact details. Editors change them in admin → Settings → Contact;
// the NEXT_PUBLIC_COMPANY_* env values and company-location.json are the defaults.
import {defaultSettings,type SiteSettings} from './site-settings-defaults';

export type CompanyContact=Pick<SiteSettings,'contact_email'|'contact_whatsapp'|'city'|'area'|'address'|'map_query'|'directions_note'>;
export type Company=ReturnType<typeof companyFrom>;

export function companyFrom(settings:CompanyContact){
  const digits=settings.contact_whatsapp.replace(/\D/g,'');
  const validWhatsapp=/^\d{8,15}$/.test(digits);
  return {
    name:'Dreamscape Adventure Treks Pvt. Ltd.',
    registration:'32543/61/62',
    pan:'301826486',
    tourismLicense:'712/061/062',
    email:settings.contact_email,
    whatsapp:validWhatsapp?settings.contact_whatsapp:'',
    whatsappUrl:validWhatsapp?`https://wa.me/${digits}`:'',
    location:settings.city,
    area:settings.area,
    address:settings.address,
    mapQuery:settings.map_query,
    directionsNote:settings.directions_note,
  };
}
export const contactFields=(settings:SiteSettings):CompanyContact=>({contact_email:settings.contact_email,contact_whatsapp:settings.contact_whatsapp,city:settings.city,area:settings.area,address:settings.address,map_query:settings.map_query,directions_note:settings.directions_note});

/** Defaults only; pages and components should read the saved settings instead. */
export const company=companyFrom(defaultSettings);
