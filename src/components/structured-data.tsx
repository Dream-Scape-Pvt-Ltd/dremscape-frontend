import {serializeJsonLd} from '@/lib/structured-data';
export default function StructuredData({data}:{data:Record<string,unknown>}){return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeJsonLd(data)}}/>;}
