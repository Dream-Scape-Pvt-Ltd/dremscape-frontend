import AdminLogin from '@/components/admin-login';
import {getSiteSettings} from '@/lib/site-settings';

export default async function Page(){const settings=await getSiteSettings();return <AdminLogin backgroundImage={settings.admin_login_image}/>;}
