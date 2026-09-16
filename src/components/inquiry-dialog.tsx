'use client';
import {useEffect,useRef} from 'react';
import InquiryForm from './inquiry-form';
export default function InquiryDialog({journey,onClose,tripId}:{journey:string;onClose:()=>void;tripId?:string}) {
  const dialog=useRef<HTMLDialogElement>(null);
  useEffect(()=>{const focus=document.activeElement as HTMLElement;const previous=document.body.style.overflow;dialog.current?.showModal();document.body.style.overflow='hidden';return()=>{document.body.style.overflow=previous;focus?.focus();};},[]);
  return <dialog ref={dialog} aria-labelledby="inquiry-heading" onCancel={onClose} onClick={event=>{if(event.target===event.currentTarget)onClose();}}><div className="dialog-inner"><button className="close-dialog" aria-label="Close inquiry" onClick={onClose}>×</button><p className="eyebrow">Your journey, your pace</p><h2 id="inquiry-heading">Let’s find your horizon.</h2><InquiryForm journey={journey} tripId={tripId}/></div></dialog>;
}
