import {backend,backendConfigured,BackendError} from './backend';
import {allPages} from './journeys';
import {journalPosts} from './editorial-content';
import {asset} from './assets';
export type Guide={slug:string;title:string;category:string;excerpt:string;image:string;reading?:string;sections?:{title:string;body:string}[];markdown?:string;author?:string};
type ApiGuide={slug:string;title:string;category:string;hero_image_url:string;markdown_content?:string;meta_description?:string;author?:{full_name:string}};
const localGuides:Guide[]=journalPosts.map(p=>({...p,image:asset(p.image),sections:p.sections.map(s=>({...s})),author:'Dreamscape journal'}));
function adapt(g:ApiGuide):Guide {
 if(!g||typeof g.slug!=='string'||!/^[\w-]+$/.test(g.slug)||typeof g.title!=='string')throw new BackendError('The journal data is incomplete.');
 return {slug:g.slug,title:g.title,category:g.category||'Journal',excerpt:g.meta_description||'Notes, ideas and perspectives from the Dreamscape journal.',image:/^https?:\/\//.test(g.hero_image_url||'')?g.hero_image_url:'',markdown:g.markdown_content,author:g.author?.full_name};
}
export async function listGuides():Promise<Guide[]>{if(!backendConfigured())return localGuides;return (await allPages<ApiGuide>('content/guides/')).map(adapt);}
export async function getGuide(slug:string):Promise<Guide>{if(!/^[\w-]+$/.test(slug))throw new BackendError('Article not found.',404);if(!backendConfigured()){const g=localGuides.find(g=>g.slug===slug);if(!g)throw new BackendError('Article not found.',404);return g;}return adapt(await backend<ApiGuide>(`content/guides/${slug}/`));}
