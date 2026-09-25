import AdminDashboard from './components/admin-dashboard';
import AdminLogin from '@/components/admin-login';
import {cookies} from 'next/headers';
import {getSiteSettings} from '@/lib/site-settings';
export const metadata={title:'Staff workspace | Dreamscape',robots:{index:false,follow:false}};
export default async function Page(){const [session,settings]=await Promise.all([(async()=>((await cookies()).get('dreamscape_session')))(),getSiteSettings()]);return session?<AdminDashboard backgroundImage={settings.admin_login_image}/>:<AdminLogin backgroundImage={settings.admin_login_image}/>;}
