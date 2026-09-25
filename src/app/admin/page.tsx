import AdminDashboard from './components/admin-dashboard';
import {getSiteSettings} from '@/lib/site-settings';
export const metadata={title:'Staff workspace | Dreamscape',robots:{index:false,follow:false}};
export default async function Page(){const settings=await getSiteSettings();return <AdminDashboard loginImage={settings.admin_login_image}/>;}
