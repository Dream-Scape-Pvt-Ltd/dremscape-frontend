import {backend,backendConfigured,BackendError} from './backend';
import {allPages} from './journeys';
import {journalPosts} from './editorial-content';
import {asset} from './assets';
import {memoryPhotos} from './trek-memories';
export type BlogComment={id:string;author_name:string;body:string;created_at:string};
/** One part of an article. `image` is set only for sectioned posts written in the blog studio. */
export type GuideSection={title:string;body:string;image?:string;caption?:string};
export type Guide={slug:string;title:string;category:string;excerpt:string;image:string;galleryImages?:string[];reading?:string;photoIds?:readonly string[];sections?:GuideSection[];markdown?:string;author?:string;managed?:boolean;viewCount?:number;commentCount?:number;comments?:BlogComment[]};
type ApiSection={heading?:string;body?:string;image_url?:string;image_caption?:string};
type ApiGuide={slug:string;title:string;category:string;hero_image_url:string;gallery_images?:string[];sections?:ApiSection[];markdown_content?:string;meta_description?:string;summary?:string;author?:{full_name:string};view_count?:number;comment_count?:number;comments?:BlogComment[]};
const localGuides:Guide[]=journalPosts.map(p=>({...p,image:asset(p.image),sections:p.sections.map(s=>({...s})),author:'Memories from past treks · Dreamscape',managed:false}));
function adapt(g:ApiGuide):Guide {
 if(!g||typeof g.slug!=='string'||!/^[\w-]+$/.test(g.slug)||typeof g.title!=='string')throw new BackendError('The journal data is incomplete.');
 const original=journalPosts.find(p=>p.slug===g.slug);
 const photos=(g.gallery_images||[]).map(url=>memoryPhotos.find(p=>url.endsWith(p.src))?.id).filter((id):id is string=>!!id);
 const safeImage=(url?:string)=>typeof url==='string'&&(/^https?:\/\//.test(url)||/^\/(?!\/)/.test(url))?url:undefined;
 // Sectioned posts from the blog studio; older posts fall back to splitting their Markdown on `## ` headings.
 const authored:GuideSection[]|undefined=Array.isArray(g.sections)&&g.sections.length?g.sections.map(s=>({title:(s.heading||'').trim(),body:(s.body||'').trim(),image:safeImage(s.image_url),caption:(s.image_caption||'').trim()||undefined})):undefined;
 const sectionImages=authored?.map(s=>s.image).filter((url):url is string=>!!url)||[];
 const sections=authored||(g.markdown_content?.startsWith('## ')?g.markdown_content.split(/^## /m).filter(Boolean).map(block=>{const at=block.indexOf('\n');return {title:block.slice(0,at).trim(),body:block.slice(at+1).trim()};}):undefined);
 const archiveCover=memoryPhotos.find(p=>g.hero_image_url?.endsWith(p.src));
 return {sections,photoIds:photos.length?photos:undefined,reading:original?.reading,slug:g.slug,title:g.title,category:g.category||'Journal',excerpt:g.summary||g.meta_description||authored?.find(s=>s.body)?.body.slice(0,180)||g.markdown_content?.slice(0,180)||'Notes, ideas and perspectives from the Dreamscape journal.',image:archiveCover?.src||(/^https?:\/\//.test(g.hero_image_url||'')?g.hero_image_url:''),galleryImages:sectionImages.length?sectionImages:Array.isArray(g.gallery_images)?g.gallery_images:[],markdown:g.markdown_content,author:g.author?.full_name,managed:true,viewCount:g.view_count||0,commentCount:g.comment_count||0,comments:g.comments||[]};
}
export async function listGuides():Promise<Guide[]>{if(!backendConfigured())return localGuides;return (await allPages<ApiGuide>('content/guides/')).map(adapt);}
export async function getGuide(slug:string):Promise<Guide>{if(!/^[\w-]+$/.test(slug))throw new BackendError('Article not found.',404);if(!backendConfigured()){const local=localGuides.find(g=>g.slug===slug);if(local)return local;throw new BackendError('Article not found.',404);}return adapt(await backend<ApiGuide>(`content/guides/${slug}/`));}
