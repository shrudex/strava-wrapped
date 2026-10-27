import { useState, useMemo } from 'react';
import { html } from '../html.js';
import { DAY, SITE_URL } from '../lib/constants.js';
import { fK, fD } from '../lib/format.js';

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
 x.font='700 40px sans-serif';x.fillText('Make yours: '+SITE_URL.replace(/^https?:\/\//,'').replace(/\/$/,''),70,975);
 x.font='400 26px sans-serif';x.fillText('Independent project, not affiliated with Strava',70,1016);x.fillText('Vibe coded with love by Shubh Sinha (shrudex)',70,1050);
 return c.toDataURL('image/png');
}
export function Share({cards,text}){
 const [k,setK]=useState(0);const [msg,setMsg]=useState('');
 const url=useMemo(()=>drawCard(k,cards[k]),[k,cards]);
 const full=text+' '+SITE_URL,enc=encodeURIComponent;
 const file=()=>{const b=atob(url.split(',')[1]),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return new File([u],'strava-wrapped.png',{type:'image/png'})};
 const native=async()=>{try{const f=file();if(navigator.canShare&&navigator.canShare({files:[f]}))await navigator.share({files:[f],text:full});else if(navigator.share)await navigator.share({text:full});else setMsg('Press and hold the card to save it, then use the buttons to post.')}catch(e){}};
 const copy=async()=>{try{await navigator.clipboard.writeText(full);setMsg('Message copied.')}catch(e){setMsg('Could not copy. Select the message below instead.')}};
 return html`<div className="card"><h2>Share cards</h2>
 <div>${cards.map((c,i)=>html`<button key=${i} className=${'chip'+(i==k?' on':'')} onClick=${()=>setK(i)}>${c.name}</button>`)}</div>
 <img className="sc" src=${url} alt=${'Share card: '+cards[k].big+' '+cards[k].unit}/>
 <p className="mut" style=${{userSelect:'all'}}>${full}</p>
 <p><button className="btn" onClick=${native}>Share card</button> <a className="btn alt" style=${{display:'inline-block',textDecoration:'none'}} href=${'https://wa.me/?text='+enc(full)} target="_blank" rel="noopener noreferrer">WhatsApp</a> <a className="btn alt" style=${{display:'inline-block',textDecoration:'none'}} href=${'https://twitter.com/intent/tweet?text='+enc(text)+'&url='+enc(SITE_URL)+'&hashtags=StravaWrapped'} target="_blank" rel="noopener noreferrer">X / Twitter</a> <button className="btn alt" onClick=${copy}>Copy message</button></p>
 <p className="mut">${msg||'WhatsApp and X open with the message ready. Save the card image and attach it. Cards contain stats only, never routes or coordinates.'}</p></div>`}
export function Line({pts,label}){
 const X=Math.max(...pts.map(p=>p[0])),zs=pts.map(p=>p[1]),lo=Math.min(...zs),hi=Math.max(...zs),sp=Math.max(hi-lo,10);
 const xy=pts.map(p=>(p[0]/X*300).toFixed(1)+','+(100-(p[1]-lo)/sp*90).toFixed(1));
 return html`<svg role="img" aria-label=${label} viewBox="0 0 320 140" style=${{width:'100%',height:'auto'}}><g transform="translate(10,22)">
  <text x="0" y="-8" fontSize="11" fill="var(--mut)">Low ${Math.round(lo)} m · High ${Math.round(hi)} m</text>
  <path d=${'M0,100 L'+xy.join(' L')+' L300,100 Z'} fill="var(--b)" fillOpacity=".25"/>
  <polyline fill="none" stroke="var(--b)" strokeWidth="2.5" strokeLinejoin="round" points=${xy.join(' ')}/>
  <text x="0" y="116" fontSize="11" fill="var(--mut)">0 km</text><text x="300" y="116" textAnchor="end" fontSize="11" fill="var(--mut)">${fK(X)} km</text></g></svg>`}
export function Heat({S,a,b}){
 const end=Math.min(b,Date.now()),m={},has=new Set();
 S.forEach(x=>{const d=Math.floor(x.t/DAY);has.add(d);m[d]=(m[d]||0)+(x.dist||0)});
 const d0=Math.floor(a/DAY),d1=Math.floor(end/DAY),w1=Math.floor((d1+3)/7),w0=Math.max(Math.floor((d0+3)/7),w1-59),mx=Math.max(...Object.values(m),1),cells=[];
 for(let w=w0;w<=w1;w++)for(let r=0;r<7;r++){const d=w*7-3+r;if(d<d0||d>d1)continue;const v=m[d]||0,on=has.has(d);
  cells.push(html`<rect key=${d} x=${(w-w0)*15} y=${r*15} width="12" height="12" rx="3" fill=${on?'var(--a)':'var(--line)'} fillOpacity=${on?(v?.35+.65*v/mx:.5):1}><title>${fD(d*DAY)}${on?(v?': '+fK(v)+' km':': run, no distance'):': rest day'}</title></rect>`)}
 return html`<div style=${{overflowX:'auto'}}><svg role="img" aria-label=${'Calendar heatmap: '+has.size+' days with a run. Darker means more distance.'} viewBox=${'0 0 '+(w1-w0+1)*15+' 104'} style=${{width:'max(100%,'+(w1-w0+1)*13+'px)',height:'auto',display:'block'}}>${cells}</svg></div>`}
export function AiSummary({facts,fallback}){
 const [s,setS]=useState({k:'idle'});
 const go=async()=>{setS({k:'load'});try{const r=await fetch('/api/summary',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({facts})});const j=await r.json();setS(j.ok?{k:'ai',text:j.text}:{k:'fb',why:j.error})}catch(e){setS({k:'fb',why:'offline'})}};
 return html`<div><p style=${{fontSize:18}}>${s.k=='ai'?s.text:fallback}</p>
  <div className="noprint">${s.k!='ai'&&html`<button className="chip" disabled=${s.k=='load'} onClick=${go}>${s.k=='load'?'Writing…':'Rewrite with AI'}</button>`}
  <span className="mut">${s.k=='ai'?'AI-written from your totals. Numbers are checked against your data.':s.k=='fb'?(s.why=='not_configured'?'AI isn’t set up on this site yet, so this is the standard summary.':'AI couldn’t produce a verified summary, so this is the standard one.'):'Opt-in: only totals like distance and counts are sent. No routes, names or dates of single runs.'}</span></div></div>`}
