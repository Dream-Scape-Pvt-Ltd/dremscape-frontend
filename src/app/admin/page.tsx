import AdminDashboard from './components/admin-dashboard';
import AdminLogin from '@/components/admin-login';
import {getSiteSettings} from '@/lib/site-settings';
import {staffAccess} from '@/lib/staff';
export const metadata={title:'Staff workspace | Dreamscape',robots:{index:false,follow:false}};
// Verify the session with the backend before sending the dashboard, so a stale or forged cookie gets the login form.
const isStaff=()=>staffAccess().then(()=>true,()=>false);
export default async function Page(){const [staff,settings]=await Promise.all([isStaff(),getSiteSettings()]);return staff?<AdminDashboard backgroundImage={settings.admin_login_image}/>:<AdminLogin backgroundImage={settings.admin_login_image}/>;}
