import { useState, useMemo } from 'react';
import { html } from '../html.js';

export function Bars({v,l,tops,h=110,c='var(--a)',label}){
 const mx=Math.max(...v,1e-9);
 return html`<div style=${{overflowX:'auto'}}><svg role="img" aria-label=${label} viewBox=${'0 0 '+v.length*36+' '+(h+34)} style=${{width:'max(100%,'+v.length*30+'px)',height:'auto',display:'block'}}>
 ${v.map((y,i)=>{const bh=Math.max(y>0?3:0,y/mx*h);return html`<g key=${i}><rect x=${i*36+4} y=${h+14-bh} width="28" height=${bh} rx="6" fill=${c}/><text x=${i*36+18} y=${h+29} textAnchor="middle" fontSize="11" fill="var(--mut)">${l[i]}</text>${tops&&tops[i]?html`<text x=${i*36+18} y=${h+9-bh} textAnchor="middle" fontSize="10" fill="var(--ink)">${tops[i]}</text>`:null}</g>`})}</svg></div>`}
export const Kpi=(k,v)=>html`<div className="kpi" key=${k}><b>${v}</b><span>${k}</span></div>`;
export function Route({R}){
 const la=R.map(p=>p[0]),lo=R.map(p=>p[1]),c=Math.cos(la[0]*Math.PI/180),x0=Math.min(...lo),y0=Math.min(...la),w=(Math.max(...lo)-x0)*c||1e-6,h=(Math.max(...la)-y0)||1e-6,s=180/Math.max(w,h);
 return html`<svg role="img" aria-label="Route shape of your longest tracked run" viewBox="-10 -10 220 220" style=${{width:160,height:160}}><polyline fill="none" stroke="var(--b)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" points=${R.map(p=>((p[1]-x0)*c*s).toFixed(1)+','+(180-(p[0]-y0)*s).toFixed(1)).join(' ')}/></svg>`}
export function drawCard(k,C){
 const c=document.createElement('canvas');c.width=c.height=1080;const x=c.getContext('2d');
 const g=x.createLinearGradient(0,0,1080,1080);const pal=[['#ff4b2b','#7b3cff'],['#7b3cff','#13b5a0'],['#13b5a0','#ff4b2b']][k%3];g.addColorStop(0,pal[0]);g.addColorStop(1,pal[1]);x.fillStyle=g;x.fillRect(0,0,1080,1080);
 x.fillStyle='#fff';x.font='700 44px sans-serif';x.fillText(C.per,70,120);x.font='400 36px sans-serif';x.fillText(C.sub,70,175);
 x.font='900 230px Impact, sans-serif';x.fillText(C.big,70,500);x.font='700 54px sans-serif';x.fillText(C.unit,70,580);
 x.font='600 46px sans-serif';C.lines.forEach((t,i)=>x.fillText(t,70,700+i*68));
 x.font='400 30px sans-serif';x.fillText('Strava Wrapped · independent project',70,1000);x.fillText('Vibe coded with love by Shubh Sinha (shrudex)',70,1040);
 return c.toDataURL('image/png');
}
export function Share({cards}){
 const [k,setK]=useState(0);const [msg,setMsg]=useState('');
 const url=useMemo(()=>drawCard(k,cards[k]),[k,cards]);
 const go=async()=>{try{const b=atob(url.split(',')[1]),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);const f=new File([u],'strava-wrapped.png',{type:'image/png'});
  if(navigator.canShare&&navigator.canShare({files:[f]}))await navigator.share({files:[f]});else setMsg('Press and hold the card to save it.')}catch(e){setMsg('Press and hold the card to save it.')}};
 return html`<div className="card"><h2>Share cards</h2>
 <div>${cards.map((c,i)=>html`<button key=${i} className=${'chip'+(i==k?' on':'')} onClick=${()=>setK(i)}>${c.name}</button>`)}</div>
 <img className="sc" src=${url} alt=${'Share card: '+cards[k].big+' '+cards[k].unit}/>
 <p><button className="btn" onClick=${go}>Share or save card</button></p><p className="mut">${msg||'Cards contain stats only, never routes or coordinates.'}</p></div>`}
