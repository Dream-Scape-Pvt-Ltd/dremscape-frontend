import Destinations from '../components/destinations';
import {listDestinationContent} from '@/lib/destination-content';
export default async function NepalPage(){const regions=(await listDestinationContent().catch(()=>[])).filter(r=>r.country==='NEPAL');return <Destinations regions={regions}/>;}
