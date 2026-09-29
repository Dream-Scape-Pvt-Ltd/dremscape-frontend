'use client';

import {useEffect,useState,type FormEvent,type ReactNode} from 'react';
import {api} from './admin-utils';
import {sortMenuItems} from '@/lib/menu-items';
import type {MenuType,NavLink,NavMenuData,NavMenuItem} from '@/lib/nav-content';
import styles from './settings.module.css';

type Draft={name:string;description:string;href?:string};
type Status={tone:'ok'|'error';text:string}|null;
type Intro=Pick<NavMenuData,'eyebrow'|'title'|'intro'|'image'|'all_label'|'href'>;
const validPhoto=(value:string)=>!value.trim()||/^(\/images\/|\/svg\/|https:\/\/)/.test(value.trim())||/^[\w-]+$/.test(value.trim());
const validHref=(value:string)=>/^\/[^\s]*$|^https:\/\/\S+$/.test(value.trim());
const message=(reason:unknown,fallback:string)=>reason instanceof Error?reason.message:fallback;

function StatusLine({status}:{status:Status}){
  return status?<p className={status.tone==='ok'?styles.ok:styles.error} role={status.tone==='ok'?'status':'alert'}>{status.text}</p>:null;
}

/** Runs one change at a time and reports how it went. */
function useTask(onDone:()=>Promise<void>){
  const [busy,setBusy]=useState(false);
  const [status,setStatus]=useState<Status>(null);
  async function run(task:()=>Promise<unknown>,done:string,after?:()=>void){
    if(busy)return;
    setBusy(true);setStatus(null);
    try{await task();await onDone();after?.();setStatus({tone:'ok',text:done});}
    catch(reason){setStatus({tone:'error',text:message(reason,'The change could not be saved.')});}
    finally{setBusy(false);}
  }
  return {busy,status,setStatus,run};
}

function ItemForm({initial,withLink,submitLabel,busy,onSubmit,onCancel}:{initial:Draft;withLink?:boolean;submitLabel:string;busy:boolean;onSubmit:(draft:Draft)=>void;onCancel:()=>void}){
  const [draft,setDraft]=useState(initial);
  const linkOk=!withLink||validHref(draft.href||'');
  function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();onSubmit({name:draft.name.trim(),description:draft.description.trim(),...(withLink?{href:(draft.href||'').trim()}:{})});}
  return <form className={`${styles.form} ${withLink?styles.formWide:''}`} onSubmit={submit}>
    <label>Title<input autoFocus value={draft.name} maxLength={150} required onChange={event=>setDraft({...draft,name:event.target.value})}/></label>
    <label>Subtitle<input value={draft.description} maxLength={300} placeholder="Short line shown under the title" onChange={event=>setDraft({...draft,description:event.target.value})}/></label>
    {withLink&&<label>Link<input value={draft.href||''} maxLength={300} required placeholder="/about or https://…" aria-invalid={!linkOk} onChange={event=>setDraft({...draft,href:event.target.value})}/></label>}
    <div className={styles.formActions}>
      <button type="submit" className={styles.primary} disabled={busy||!draft.name.trim()||!linkOk}>{busy?'Saving…':submitLabel}</button>
      <button type="button" className={styles.link} onClick={onCancel}>Cancel</button>
    </div>
  </form>;
}

function Row({title,subtitle,meta,hidden,first,last,busy,onMove,actions}:{title:string;subtitle:string;meta?:string;hidden?:boolean;first:boolean;last:boolean;busy:boolean;onMove:(step:number)=>void;actions:ReactNode}){
  return <li className={`${styles.row} ${hidden?styles.hidden:''}`}>
    <div className={styles.order}>
      <button type="button" aria-label={`Move ${title} up`} disabled={busy||first} onClick={()=>onMove(-1)}>↑</button>
      <button type="button" aria-label={`Move ${title} down`} disabled={busy||last} onClick={()=>onMove(1)}>↓</button>
    </div>
    <div className={styles.text}>
      <strong>{title}{hidden&&<span className={styles.pill}>Hidden</span>}</strong>
      <span>{subtitle||<em>No subtitle</em>}</span>
      {meta&&<small>{meta}</small>}
    </div>
    <div className={styles.actions}>{actions}</div>
  </li>;
}

const patchMenu=(slug:string,body:Partial<NavMenuData>)=>api(`/api/admin/nav-menus/${slug}`,{method:'PATCH',body:JSON.stringify(body)});

/** The label, headline, intro and photo on the left of the open menu. */
function IntroPanel({menu,reload}:{menu:NavMenuData;reload:()=>Promise<void>}){
  const initial:Intro={eyebrow:menu.eyebrow,title:menu.title,intro:menu.intro,image:menu.image,all_label:menu.all_label,href:menu.href};
  const [editing,setEditing]=useState(false);
  const [draft,setDraft]=useState<Intro>(initial);
  const task=useTask(reload);
  const isLinks=menu.menu_type==='LINKS';
  const set=(field:keyof Intro,value:string)=>setDraft({...draft,[field]:value});
  const ok=validPhoto(draft.image)&&(!isLinks||!draft.href.trim()||validHref(draft.href));

  function save(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    void task.run(()=>patchMenu(menu.slug,isLinks?draft:{...draft,href:''}),'Menu intro saved.',()=>setEditing(false));
  }

  if(!editing)return <div className={styles.intro}>
    <div>
      <span className={styles.introLabel}>Menu intro</span>
      {menu.eyebrow&&<p className={styles.introEyebrow}>{menu.eyebrow}</p>}
      <strong>{menu.title||<em>No headline yet</em>}</strong>
      {menu.intro&&<span>{menu.intro}</span>}
      <small>Link text: “{menu.all_label||'Explore all'}” → {isLinks?menu.href||'—':`/treks?kind=${menu.slug}`}</small>
    </div>
    <button type="button" className={styles.link} onClick={()=>{setDraft(initial);setEditing(true);task.setStatus(null);}}>Edit</button>
    <StatusLine status={task.status}/>
  </div>;

  return <form className={styles.introForm} onSubmit={save}>
    <span className={styles.introLabel}>Menu intro</span>
    <div className={styles.fields}>
      <label>Small label<input value={draft.eyebrow} maxLength={80} onChange={event=>set('eyebrow',event.target.value)}/></label>
      <label>Headline<input value={draft.title} maxLength={120} onChange={event=>set('title',event.target.value)}/></label>
      <label className={styles.wide}>Intro line<textarea rows={2} value={draft.intro} maxLength={300} onChange={event=>set('intro',event.target.value)}/></label>
      <label>Photo<input value={draft.image} maxLength={500} aria-invalid={!validPhoto(draft.image)} onChange={event=>set('image',event.target.value)}/><small>An /images/ path or an https:// link.</small></label>
      <label>“Explore all” link text<input value={draft.all_label} maxLength={80} onChange={event=>set('all_label',event.target.value)}/></label>
      {isLinks&&<label>“Explore all” goes to<input value={draft.href} maxLength={300} placeholder="/about" aria-invalid={Boolean(draft.href.trim())&&!validHref(draft.href)} onChange={event=>set('href',event.target.value)}/></label>}
    </div>
    <div className={styles.formActions}>
      <button type="submit" className={styles.primary} disabled={task.busy||!ok}>{task.busy?'Saving…':'Save intro'}</button>
      <button type="button" className={styles.link} onClick={()=>setEditing(false)}>Cancel</button>
    </div>
    <StatusLine status={task.status}/>
  </form>;
}

/** A trek menu's items: trek categories, saved one at a time through the categories API. */
function CategoryItems({menu,reload}:{menu:NavMenuData;reload:()=>Promise<void>}){
  const [editing,setEditing]=useState<string|null>(null);
  const [adding,setAdding]=useState(false);
  const task=useTask(reload);
  const list=sortMenuItems(menu.items);
  const patch=(slug:string,body:Partial<NavMenuItem>)=>api(`/api/admin/menu-categories/${slug}`,{method:'PATCH',body:JSON.stringify(body)});

  function move(index:number,step:number){
    const next=[...list];
    [next[index],next[index+step]]=[next[index+step],next[index]];
    void task.run(()=>Promise.all(next.map((item,order)=>item.sort_order===order?null:patch(item.slug,{sort_order:order}))),'Order updated.');
  }
  function remove(item:NavMenuItem){
    if(!window.confirm(`Remove “${item.name}” from ${menu.name}? This can’t be undone.`))return;
    void task.run(()=>api(`/api/admin/menu-categories/${item.slug}`,{method:'DELETE'}),`“${item.name}” removed.`);
  }

  return <>
    <StatusLine status={task.status}/>
    {list.length===0&&!adding&&<p className={styles.muted}>No items yet. The menu shows only its “Explore all” link.</p>}
    <ol className={styles.list}>
      {list.map((item,index)=>{
        const hidden=item.is_active===false;
        if(editing===item.slug)return <li key={item.slug} className={styles.row}>
          <ItemForm initial={{name:item.name,description:item.description}} submitLabel="Save" busy={task.busy} onCancel={()=>setEditing(null)}
            onSubmit={draft=>void task.run(()=>patch(item.slug,{name:draft.name,description:draft.description}),`“${draft.name}” saved.`,()=>setEditing(null))}/>
        </li>;
        return <Row key={item.slug} title={item.name} subtitle={item.description} hidden={hidden} first={index===0} last={index===list.length-1} busy={task.busy} onMove={step=>move(index,step)} actions={<>
          <button type="button" className={styles.link} disabled={task.busy} onClick={()=>{setAdding(false);setEditing(item.slug);}}>Edit</button>
          <button type="button" className={styles.link} disabled={task.busy} onClick={()=>void task.run(()=>patch(item.slug,{is_active:hidden}),hidden?`“${item.name}” is back in the menu.`:`“${item.name}” is hidden from the menu. Its treks stay in the full trek list.`)}>{hidden?'Show':'Hide'}</button>
          <button type="button" className={`${styles.link} ${styles.danger}`} disabled={task.busy} onClick={()=>remove(item)}>Remove</button>
        </>}/>;
      })}
      {adding&&<li className={styles.row}>
        <ItemForm initial={{name:'',description:''}} submitLabel={`Add to ${menu.name}`} busy={task.busy} onCancel={()=>setAdding(false)}
          onSubmit={draft=>void task.run(()=>api('/api/admin/menu-categories',{method:'POST',body:JSON.stringify({name:draft.name,description:draft.description,menu:menu.slug,sort_order:list.length})}),`“${draft.name}” added.`,()=>setAdding(false))}/>
      </li>}
    </ol>
    {!adding&&<button type="button" className={styles.add} disabled={task.busy} onClick={()=>{setEditing(null);setAdding(true);}}>+ Add item</button>}
    <p className={styles.hint}>Each item is also a trek category: pick it as a trek’s menu category in the trek editor and the trek is listed under it.</p>
  </>;
}

/** A link menu's items, stored on the menu. */
function LinkItems({menu,reload}:{menu:NavMenuData;reload:()=>Promise<void>}){
  const [editing,setEditing]=useState<number|null>(null);
  const [adding,setAdding]=useState(false);
  const task=useTask(reload);
  const links=menu.links;
  const commit=(next:NavLink[],done:string,after?:()=>void)=>void task.run(()=>patchMenu(menu.slug,{links:next}),done,after);
  const toLink=(draft:Draft):NavLink=>({label:draft.name,description:draft.description,href:draft.href||''});
  function move(index:number,step:number){
    const next=[...links];
    [next[index],next[index+step]]=[next[index+step],next[index]];
    commit(next,'Order updated.');
  }
  return <>
    <StatusLine status={task.status}/>
    {links.length===0&&!adding&&<p className={styles.muted}>No links yet. The menu shows only its “Explore all” link.</p>}
    <ol className={styles.list}>
      {links.map((link,index)=>{
        if(editing===index)return <li key={index} className={styles.row}>
          <ItemForm withLink initial={{name:link.label,description:link.description,href:link.href}} submitLabel="Save" busy={task.busy} onCancel={()=>setEditing(null)}
            onSubmit={draft=>commit(links.map((old,i)=>i===index?toLink(draft):old),`“${draft.name}” saved.`,()=>setEditing(null))}/>
        </li>;
        return <Row key={`${link.href}-${index}`} title={link.label} subtitle={link.description} meta={link.href} first={index===0} last={index===links.length-1} busy={task.busy} onMove={step=>move(index,step)} actions={<>
          <button type="button" className={styles.link} disabled={task.busy} onClick={()=>{setAdding(false);setEditing(index);}}>Edit</button>
          <button type="button" className={`${styles.link} ${styles.danger}`} disabled={task.busy} onClick={()=>{if(window.confirm(`Remove “${link.label}” from ${menu.name}?`))commit(links.filter((_,i)=>i!==index),`“${link.label}” removed.`);}}>Remove</button>
        </>}/>;
      })}
      {adding&&<li className={styles.row}>
        <ItemForm withLink initial={{name:'',description:'',href:''}} submitLabel={`Add to ${menu.name}`} busy={task.busy} onCancel={()=>setAdding(false)}
          onSubmit={draft=>commit([...links,toLink(draft)],`“${draft.name}” added.`,()=>setAdding(false))}/>
      </li>}
    </ol>
    {!adding&&<button type="button" className={styles.add} disabled={task.busy} onClick={()=>{setEditing(null);setAdding(true);}}>+ Add link</button>}
  </>;
}

function RenameForm({menu,busy,onSave,onCancel}:{menu:NavMenuData;busy:boolean;onSave:(name:string)=>void;onCancel:()=>void}){
  const [name,setName]=useState(menu.name);
  return <form className={styles.renameForm} onSubmit={event=>{event.preventDefault();onSave(name.trim());}}>
    <input autoFocus aria-label="Menu name" value={name} maxLength={60} required onChange={event=>setName(event.target.value)}/>
    <button type="submit" className={styles.primary} disabled={busy||!name.trim()}>Save</button>
    <button type="button" className={styles.link} onClick={onCancel}>Cancel</button>
  </form>;
}

function AddMenuForm({busy,onAdd,onCancel}:{busy:boolean;onAdd:(name:string,type:MenuType)=>void;onCancel:()=>void}){
  const [name,setName]=useState('');
  const [type,setType]=useState<MenuType>('CATEGORIES');
  return <form className={styles.addMenuForm} onSubmit={event=>{event.preventDefault();onAdd(name.trim(),type);}}>
    <label>Menu name<input autoFocus value={name} maxLength={60} required placeholder="e.g. Safaris" onChange={event=>setName(event.target.value)}/></label>
    <fieldset>
      <legend>It lists</legend>
      <label><input type="radio" name="menu-type" checked={type==='CATEGORIES'} onChange={()=>setType('CATEGORIES')}/>Treks, grouped into items <small>with its own trek list page</small></label>
      <label><input type="radio" name="menu-type" checked={type==='LINKS'} onChange={()=>setType('LINKS')}/>Links to pages <small>like Company</small></label>
    </fieldset>
    <div className={styles.formActions}>
      <button type="submit" className={styles.primary} disabled={busy||!name.trim()}>{busy?'Adding…':'Add menu'}</button>
      <button type="button" className={styles.link} onClick={onCancel}>Cancel</button>
    </div>
  </form>;
}

/** Admin → Settings → Header menus: every top-level menu, with its items nested beneath it. */
export default function NavigationMenuEditor(){
  const [menus,setMenus]=useState<NavMenuData[]|null>(null);
  const [open,setOpen]=useState<string|null>(null);
  const [renaming,setRenaming]=useState<string|null>(null);
  const [adding,setAdding]=useState(false);
  const [loadError,setLoadError]=useState('');

  async function reload(){
    try{setMenus(await api<NavMenuData[]>('/api/admin/nav-menus'));setLoadError('');}
    catch(reason){setLoadError(message(reason,'Could not load the menus.'));}
  }
  useEffect(()=>{void reload();},[]);
  const task=useTask(reload);

  if(!menus)return loadError?<p className={styles.error} role="alert">{loadError}</p>:<p className={styles.muted} role="status">Loading menus…</p>;
  const ordered=sortMenuItems(menus);

  function move(index:number,step:number){
    const next=[...ordered];
    [next[index],next[index+step]]=[next[index+step],next[index]];
    void task.run(()=>Promise.all(next.map((menu,order)=>menu.sort_order===order?null:patchMenu(menu.slug,{sort_order:order}))),'Menu order updated.');
  }
  function remove(menu:NavMenuData){
    if(!window.confirm(`Delete the “${menu.name}” menu from the header? This can’t be undone.`))return;
    void task.run(()=>api(`/api/admin/nav-menus/${menu.slug}`,{method:'DELETE'}),`“${menu.name}” deleted.`,()=>setOpen(null));
  }
  function add(name:string,type:MenuType){
    void task.run(async()=>{const created=await api<NavMenuData>('/api/admin/nav-menus',{method:'POST',body:JSON.stringify({name,menu_type:type,sort_order:ordered.length,all_label:`Explore ${name.toLowerCase()}`})});setOpen(created.slug);},`“${name}” added. Add its items below.`,()=>setAdding(false));
  }

  return <>
    <StatusLine status={task.status}/>
    <ol className={styles.menuTree}>
      {ordered.map((menu,index)=>{
        const expanded=open===menu.slug;
        const hidden=menu.is_active===false;
        const count=menu.menu_type==='CATEGORIES'?menu.items.length:menu.links.length;
        return <li key={menu.slug} className={`${styles.menuNode} ${expanded?styles.menuOpen:''} ${hidden?styles.hidden:''}`}>
          <div className={styles.menuHead}>
            <div className={styles.order}>
              <button type="button" aria-label={`Move ${menu.name} up`} disabled={task.busy||index===0} onClick={()=>move(index,-1)}>↑</button>
              <button type="button" aria-label={`Move ${menu.name} down`} disabled={task.busy||index===ordered.length-1} onClick={()=>move(index,1)}>↓</button>
            </div>
            {renaming===menu.slug
              ?<RenameForm menu={menu} busy={task.busy} onCancel={()=>setRenaming(null)} onSave={name=>void task.run(()=>patchMenu(menu.slug,{name}),`Renamed to “${name}”.`,()=>setRenaming(null))}/>
              :<button type="button" className={styles.menuToggle} aria-expanded={expanded} onClick={()=>setOpen(expanded?null:menu.slug)}>
                <span className={styles.caret} aria-hidden="true">{expanded?'▾':'▸'}</span>
                <strong>{menu.name}</strong>
                <span className={styles.badge}>{menu.menu_type==='CATEGORIES'?'Treks':'Links'} · {count}</span>
                {hidden&&<span className={styles.pill}>Hidden</span>}
              </button>}
            {renaming!==menu.slug&&<div className={styles.actions}>
              <button type="button" className={styles.link} disabled={task.busy} onClick={()=>setRenaming(menu.slug)}>Rename</button>
              <button type="button" className={styles.link} disabled={task.busy} onClick={()=>void task.run(()=>patchMenu(menu.slug,{is_active:hidden}),hidden?`“${menu.name}” is back in the header.`:`“${menu.name}” is hidden from the header.`)}>{hidden?'Show':'Hide'}</button>
              <button type="button" className={`${styles.link} ${styles.danger}`} disabled={task.busy} onClick={()=>remove(menu)}>Delete</button>
            </div>}
          </div>
          {expanded&&<div className={styles.menuBody}>
            <IntroPanel key={`${menu.slug}-intro`} menu={menu} reload={reload}/>
            {menu.menu_type==='CATEGORIES'?<CategoryItems menu={menu} reload={reload}/>:<LinkItems menu={menu} reload={reload}/>}
          </div>}
        </li>;
      })}
    </ol>
    {adding?<AddMenuForm busy={task.busy} onAdd={add} onCancel={()=>setAdding(false)}/>:<button type="button" className={styles.add} disabled={task.busy} onClick={()=>setAdding(true)}>+ Add menu</button>}
  </>;
}
