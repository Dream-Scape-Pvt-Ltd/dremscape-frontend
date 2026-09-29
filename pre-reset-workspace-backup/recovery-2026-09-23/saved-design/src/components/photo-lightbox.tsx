'use client';
import {useEffect,type RefObject} from 'react';
import PhotoSwipeLightbox from 'photoswipe/lightbox';

export function usePhotoLightbox(ref:RefObject<HTMLElement|null>){
  useEffect(()=>{
    if(!ref.current)return;
    const preference=matchMedia('(prefers-reduced-motion: reduce)');
    const lightbox=new PhotoSwipeLightbox({gallery:ref.current,children:'a[data-pswp-width]',pswpModule:()=>import('photoswipe'),bgOpacity:.96,showHideAnimationType:preference.matches?'none':'zoom',showAnimationDuration:450,hideAnimationDuration:320,zoomAnimationDuration:preference.matches?0:300,padding:{top:70,bottom:90,left:20,right:20},closeTitle:'Close photograph',zoomTitle:'Zoom photograph',arrowPrevTitle:'Previous photograph',arrowNextTitle:'Next photograph',returnFocus:true});
    let closeRequested=false;
    let previousFocus:HTMLElement|null=null;
    lightbox.on('beforeOpen',()=>{closeRequested=false;previousFocus=document.activeElement instanceof HTMLElement?document.activeElement:null;});
    lightbox.on('destroy',()=>{previousFocus?.focus({preventScroll:true});});
    lightbox.on('bindEvents',()=>{lightbox.pswp?.element?.focus({preventScroll:true});});
    lightbox.on('openingAnimationEnd',()=>{if(closeRequested)lightbox.pswp?.close();});
    const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'&&lightbox.pswp){closeRequested=true;lightbox.pswp.close();}};
    document.addEventListener('keydown',escape);
    lightbox.on('uiRegister',()=>lightbox.pswp?.ui?.registerElement({name:'dreamscape-caption',order:9,isButton:false,appendTo:'root',onInit:(element,pswp)=>{element.setAttribute('aria-live','polite');const update=()=>{element.textContent=pswp.currSlide?.data.element?.getAttribute('data-caption')||'';};pswp.on('change',update);update();}}));
    const change=()=>{lightbox.options.showHideAnimationType=preference.matches?'none':'zoom';lightbox.options.zoomAnimationDuration=preference.matches?0:300;lightbox.pswp?.close();};
    preference.addEventListener('change',change);lightbox.init();
    return()=>{document.removeEventListener('keydown',escape);preference.removeEventListener('change',change);lightbox.destroy();};
  },[ref]);
}
