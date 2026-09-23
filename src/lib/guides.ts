import {backend,backendConfigured,BackendError} from './backend';
import {allPages} from './journeys';
import {journalPosts} from './editorial-content';
import {asset} from './assets';
export type BlogComment={id:string;author_name:string;body:string;created_at:string};
export type Guide={slug:string;title:string;category:string;excerpt:string;image:string;galleryImages?:string[];reading?:string;photoIds?:readonly string[];sections?:{title:string;body:string}[];markdown?:string;author?:string;managed?:boolean;viewCount?:number;commentCount?:number;comments?:BlogComment[]};
type ApiGuide={slug:string;title:string;category:string;hero_image_url:string;gallery_images?:string[];markdown_content?:string;meta_description?:string;summary?:string;author?:{full_name:string};view_count?:number;comment_count?:number;comments?:BlogComment[]};
const localGuides:Guide[]=journalPosts.map(p=>({...p,image:asset(p.image),sections:p.sections.map(s=>({...s})),author:'Memories from past treks · Dreamscape',managed:false}));
function adapt(g:ApiGuide):Guide {
 if(!g||typeof g.slug!=='string'||!/^[\w-]+$/.test(g.slug)||typeof g.title!=='string')throw new BackendError('The journal data is incomplete.');
 return {slug:g.slug,title:g.title,category:g.category||'Journal',excerpt:g.summary||g.meta_description||g.markdown_content?.slice(0,180)||'Notes, ideas and perspectives from the Dreamscape journal.',image:/^https?:\/\//.test(g.hero_image_url||'')?g.hero_image_url:'',galleryImages:Array.isArray(g.gallery_images)?g.gallery_images:[],markdown:g.markdown_content,author:g.author?.full_name,managed:true,viewCount:g.view_count||0,commentCount:g.comment_count||0,comments:g.comments||[]};
}
export async function listGuides():Promise<Guide[]>{if(!backendConfigured())return localGuides;return (await allPages<ApiGuide>('content/guides/')).map(adapt);}
export async function getGuide(slug:string):Promise<Guide>{if(!/^[\w-]+$/.test(slug))throw new BackendError('Article not found.',404);if(!backendConfigured()){const local=localGuides.find(g=>g.slug===slug);if(local)return local;throw new BackendError('Article not found.',404);}return adapt(await backend<ApiGuide>(`content/guides/${slug}/`));}
