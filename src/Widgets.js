import { useState, useMemo } from 'react';
import { html } from '../html.js';
import { DAY, SITE_URL, MON, nowLocal } from '../lib/constants.js';
import { mk } from '../lib/stats.js';
import { fK, fD } from '../lib/format.js';

export function Bars({v,l,tops,tips,h,c='var(--b)',label,hi,cap,unit='',noy}){
 const n=v.length,mx=Math.max(...v,0);
 if(!(mx>0))return html`<p className="mut">Nothing to chart for this period yet.</p>`;
 const H=h||(n<=3?80:110),sl=40,small=n<=8,W=n*sl+34;
 return html`<div className="scroll"><svg role="img" aria-label=${label} viewBox=${'0 0 '+W+' '+(H+38)} style=${{width:small?'100%':'max(100%,'+n*34+'px)',maxWidth:small?Math.max(n,4)*70+34+'px':'none',height:'auto',display:'block'}}>
  ${!noy&&html`<g><text x="0" y="12" fontSize="10" fill="var(--mut)">${Math.round(mx*10)/10}${unit}</text><line x1="32" x2=${W} y1="16" y2="16" stroke="var(--line)" strokeDasharray="3 4"/></g>`}
  <line x1="32" x2=${W} y1=${H+16} y2=${H+16} stroke="var(--line)"/>
  ${v.map((y,i)=>{const bh=Math.max(y>0?3:0,y/mx*H),x0=34+i*sl;return html`<g key=${i}><title>${tips?tips[i]:l[i]+': '+y}</title><rect x=${x0+5} y=${H+16-bh} width=${sl-10} height=${bh} rx="6" fill=${hi===i?'var(--c)':c}/><text x=${x0+sl/2} y=${H+31} textAnchor="middle" fontSize="10" fill="var(--mut)">${l[i]}</text>${tops&&tops[i]?html`<text x=${x0+sl/2} y=${H+12-bh} textAnchor="middle" fontSize="10" fill="var(--ink)">${tops[i]}</text>`:null}</g>`})}</svg>
  ${cap&&html`<p className="mut" style=${{margin:'2px 0 0'}}>${cap}</p>`}</div>`}
const PATHS={
 activity:()=>html`<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/>`,
 route:()=>html`<g><circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/></g>`,
 timer:()=>html`<g><line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/></g>`,
 mountain:()=>html`<path d="m8 3 4 8 5-5 5 15H2L8 3z"/>`,
 calendar:()=>html`<g><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></g>`,
 medal:()=>html`<g><path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15"/><path d="M11 12 5.12 2.2"/><path d="m13 12 5.88-9.8"/><path d="M8 7h8"/><circle cx="12" cy="17" r="5"/></g>`,
 trophy:()=>html`<g><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></g>`,
};
const KI={'Runs':'activity','Distance (km)':'route','Moving time':'timer','Elevation (m)':'mountain','First':'calendar','Last':'calendar','GPS tracks':'route'};
export const Ic=({n})=>html`<svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">${(PATHS[n]||PATHS.activity)()}</svg>`;
export const Kpi=(k,v)=>html`<div className="kpi" key=${k}><${Ic} n=${KI[k]||'activity'}/><b>${v}</b><span>${k}</span></div>`;
export const Mini=(k,v)=>html`<div className="mini" key=${k}><b>${v}</b><span>${k}</span></div>`;
export function Route({R}){
 const la=R.map(p=>p[0]),lo=R.map(p=>p[1]),c=Math.cos(la[0]*Math.PI/180),x0=Math.min(...lo),y0=Math.min(...la),w=(Math.max(...lo)-x0)*c||1e-6,h=(Math.max(...la)-y0)||1e-6,s=180/Math.max(w,h);
 return html`<svg role="img" aria-label="Route shape of your longest tracked run" viewBox="-10 -10 220 220" style=${{width:160,height:160}}><polyline fill="none" stroke="var(--b)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" points=${R.map(p=>((p[1]-x0)*c*s).toFixed(1)+','+(180-(p[0]-y0)*s).toFixed(1)).join(' ')}/></svg>`}
export function drawCard(k,C){
 const c=document.createElement('canvas');c.width=c.height=1080;const x=c.getContext('2d');
 const g=x.createLinearGradient(0,0,1080,1080);const pal=[['#ff3d81','#7c5cff'],['#7c5cff','#28e0ff'],['#ff8a3d','#ff3d81']][k%3];g.addColorStop(0,pal[0]);g.addColorStop(1,pal[1]);x.fillStyle=g;x.fillRect(0,0,1080,1080);
 x.globalAlpha=.14;x.fillStyle='#fff';x.beginPath();x.arc(930,170,260,0,7);x.fill();x.beginPath();x.arc(120,980,200,0,7);x.fill();x.globalAlpha=1;
 x.fillStyle='#fff';x.font='700 44px sans-serif';x.fillText(C.per,70,120);x.font='400 36px sans-serif';x.fillText(C.sub,70,175);
 x.font='900 230px Impact, sans-serif';x.fillText(C.big,70,500);x.font='700 54px sans-serif';x.fillStyle='#c6ff3d';x.fillText(C.unit,70,580);x.fillStyle='#fff';
 x.font='600 46px sans-serif';C.lines.forEach((t,i)=>x.fillText(t,70,700+i*68));
 x.font='700 40px sans-serif';x.fillText('Make yours: '+SITE_URL.replace(/^https?:\/\//,'').replace(/\/$/,''),70,950);
 x.font='400 26px sans-serif';x.fillText('X: @shrudex   LinkedIn: in/codeshubh',70,992);x.fillText('Independent project, not affiliated with Strava',70,1026);x.fillText('Vibe coded with love by Shubh Sinha (shrudex)',70,1060);
 return c.toDataURL('image/png');
}
export function Share({cards,text}){
 const [k,setK]=useState(0);const [msg,setMsg]=useState('');
 const url=useMemo(()=>drawCard(k,cards[k]),[k,cards]);
 const full=text+' '+SITE_URL,enc=encodeURIComponent;
 const file=()=>{const b=atob(url.split(',')[1]),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return new File([u],'strava-wrapped.png',{type:'image/png'})};
 const native=async()=>{try{const f=file();if(navigator.canShare&&navigator.canShare({files:[f]}))await navigator.share({files:[f],text:full});else if(navigator.share)await navigator.share({text:full});else setMsg('Press and hold the card to save it, then use the buttons to post.')}catch(e){}};
 const copy=async()=>{try{await navigator.clipboard.writeText(full);setMsg('Message copied.')}catch(e){setMsg('Could not copy. Select the message below instead.')}};
 return html`<div className="card"><h2>📲 Share cards</h2>
 <div>${cards.map((c,i)=>html`<button key=${i} className=${'chip'+(i==k?' on':'')} onClick=${()=>setK(i)}>${c.name}</button>`)}</div>
 <img className="sc" src=${url} alt=${'Share card: '+cards[k].big+' '+cards[k].unit}/>
 <p className="mut" style=${{userSelect:'all'}}>${full}</p>
 <p><button className="btn" onClick=${native}>Share card</button> <a className="btn alt" style=${{display:'inline-block',textDecoration:'none'}} href=${'https://wa.me/?text='+enc(full)} target="_blank" rel="noopener noreferrer">WhatsApp</a> <a className="btn alt" style=${{display:'inline-block',textDecoration:'none'}} href=${'https://twitter.com/intent/tweet?text='+enc(text)+'&url='+enc(SITE_URL)+'&hashtags=StravaWrapped&via=shrudex'} target="_blank" rel="noopener noreferrer">X / Twitter</a> <button className="btn alt" onClick=${copy}>Copy message</button></p>
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
 const today=Math.floor(nowLocal()/DAY),m={},has=new Set();
 S.forEach(x=>{const d=Math.floor(x.t/DAY);has.add(d);m[d]=(m[d]||0)+(x.dist||0)});
 const d0=Math.floor(a/DAY),d1=Math.floor(b/DAY),mx=Math.max(...Object.values(m),1);
 let ks=[];for(let k=mk(a);k<=mk(b);k++)ks.push(k);
 const cutN=ks.length>12;ks=ks.slice(-12);
 const months=ks.map(k=>{const y=Math.floor(k/12),mo=k%12,first=(new Date(Date.UTC(y,mo,1)).getUTCDay()+6)%7,n=new Date(Date.UTC(y,mo+1,0)).getUTCDate(),cells=[];
  for(let i=0;i<first;i++)cells.push(html`<span key=${'p'+i} className="dc pad"></span>`);
  for(let dd=1;dd<=n;dd++){const d=Math.floor(Date.UTC(y,mo,dd)/DAY),out=d<d0||d>d1,run=has.has(d),v=m[d]||0;
   const kind=out?'out':run?'run':d>today?'fut':'rest';
   const tip=out?'Outside the selected period':fD(d*DAY)+(run?(v?': '+fK(v)+' km':': run, distance not recorded'):d>today?': upcoming':': no run recorded');
   cells.push(html`<span key=${d} role="img" aria-label=${tip} title=${tip} className=${'dc '+kind+(d==today?' today':'')} style=${run?{background:'color-mix(in srgb,var(--a) '+Math.round((v?.35+.65*v/mx:.5)*100)+'%,transparent)'}:null}>${dd}</span>`)}
  return html`<div key=${k} className="mo"><h3>${MON[mo]} ${y}</h3><div className="mg">${'MTWTFSS'.split('').map((c,i)=>html`<span key=${i} className="dw">${c}</span>`)}${cells}</div></div>`});
 return html`<div><div className="months">${months}</div>
  <div className="legend"><span><i className="dc run" style=${{background:'var(--a)'}}></i> Run (darker = more km)</span><span><i className="dc rest"></i> No run recorded</span><span><i className="dc fut"></i> Upcoming</span></div>
  <p className="mut">${has.size} day${has.size==1?'':'s'} with a run in this period.${cutN?' Showing the last 12 months of the range.':''}</p></div>`}
export function AiSummary({facts,fallback}){
 const [s,setS]=useState({k:'idle'});
 const go=async()=>{setS({k:'load'});try{const r=await fetch('/api/summary',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({facts})});const j=await r.json();setS(j.ok?{k:'ai',text:j.text}:{k:'fb',why:j.error})}catch(e){setS({k:'fb',why:'offline'})}};
 return html`<div><p style=${{fontSize:18}}>${s.k=='ai'?s.text:fallback}</p>
  <div className="noprint">${s.k!='ai'&&html`<button className="chip" disabled=${s.k=='load'} onClick=${go}>${s.k=='load'?'Writing…':'Rewrite with AI'}</button>`}
  <span className="mut">${s.k=='ai'?'AI-written from your totals. Numbers are checked against your data.':s.k=='fb'?(s.why=='not_configured'?'AI isn’t set up on this site yet, so this is the standard summary.':'AI couldn’t produce a verified summary, so this is the standard one.'):'Opt-in: only totals like distance and counts are sent. No routes, names or dates of single runs.'}</span></div></div>`}
