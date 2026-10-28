import { useState } from 'react';
import JSZip from 'jszip';
import { html } from './html.js';
import { parseCSV, pd, localize } from './lib/parse.js';
import { fD } from './lib/format.js';
import { X_URL, LINKEDIN_URL } from './lib/constants.js';
import { INTRO, FAQ } from './content/faq.js';
import { Kpi } from './components/Widgets.js';
import { Report } from './components/Report.js';

export function App(){
 const [D,setD]=useState(null),[z,setZ]=useState(null),[err,setErr]=useState(''),[busy,setBusy]=useState(false),[go,setGo]=useState(false),[over,setOver]=useState(false);
 const load=async f=>{if(!f)return;setErr('');setBusy(true);
  try{
   if(!/\.zip$/i.test(f.name))throw Error('Please choose the .zip file from your Strava export.');
   if(f.size>1.5e9)throw Error('This file is over 1.5 GB, which is too large to process in the browser.');
   const zz=await JSZip.loadAsync(f);let tot=0;
   for(const k in zz.files){if(/(^|[\\/])\.\.([\\/]|$)/.test(k)||/^([\\/]|[A-Za-z]:)/.test(k))throw Error('Unsafe archive: it contains paths outside the export folder. Nothing was processed.');tot+=(zz.files[k]._data&&zz.files[k]._data.uncompressedSize)||0}
   if(tot>8e9||(f.size&&tot/f.size>300))throw Error('Unsafe archive: the compression ratio is unusually high. Nothing was processed.');
   const ck=Object.keys(zz.files).find(k=>/(^|\/)activities\.csv$/i.test(k));
   if(!ck)throw Error('activities.csv was not found. Request your export in Strava under Settings, My Account, Download or Delete Your Account, then upload that ZIP.');
   const rows=parseCSV(await zz.file(ck).async('string')).filter(r=>r.some(c=>c.trim()));
   if(rows.length<2)throw Error('activities.csv has no activity rows.');
   const seen={},H=rows[0].map(h=>{h=h.trim();const c=(seen[h]=(seen[h]??-1)+1);return c?h+'.'+c:h});
   const gi=(r,n)=>{const i=H.indexOf(n);if(i<0)return null;const v=(r[i]||'').trim();return v===''?null:v};
   const gn=(r,n)=>{const v=gi(r,n);if(v==null)return null;const x=Number(v.replace(/,/g,''));return isFinite(x)?x:null};
   const base=ck.slice(0,ck.length-'activities.csv'.length);let bad=0;const acts=[];
   rows.slice(1).forEach((r,i)=>{const t=pd(gi(r,'Activity Date'));if(t==null){bad++;return}
    let dist=gn(r,'Distance.1');if(dist==null&&gn(r,'Distance')!=null)dist=gn(r,'Distance')*1000;
    const fn=gi(r,'Filename');let gps='none';if(fn){const ex=!!zz.file(base+fn);gps=!ex?'missing':/\.(gpx|tcx|fit)(\.gz)?$/i.test(fn)?'track':'unsupported'}
    const type=(gi(r,'Activity Type')||'Unknown').trim();
    acts.push({id:gi(r,'Activity ID')||'row'+i,t:localize(t),name:gi(r,'Activity Name'),type,k:type.toLowerCase(),dist,mt:gn(r,'Moving Time'),et:gn(r,'Elapsed Time'),elev:gn(r,'Elevation Gain'),hr:gn(r,'Average Heart Rate'),file:fn?base+fn:null,gps})});
   if(!acts.length)throw Error('No activities could be read from activities.csv. The export format may have changed.');
   const runs=acts.filter(x=>x.k=='run'),ign={};acts.filter(x=>x.k!='run').forEach(x=>ign[x.type]=(ign[x.type]||0)+1);
   if(!runs.length)throw Error('No runs were found in this export (activity type “Run”). Other activity types are ignored.');
   setZ(zz);setD({acts:runs,ign,bad});
  }catch(e){setErr(e.message||'Could not read that file.')}
  setBusy(false)};
 const reset=()=>{setD(null);setZ(null);setGo(false);setErr('')};
 if(D&&go)return html`<${Report} D=${D} zip=${z} onBack=${reset}/>`;
 if(D){const ds=D.acts.map(x=>x.t);
  return html`<div className="wrap"><h1>Import <span className="grad">locked in</span> ✅</h1><div className="card"><div className="grid">${[Kpi('Runs',D.acts.length),Kpi('First',fD(Math.min(...ds))),Kpi('Last',fD(Math.max(...ds))),Kpi('GPS tracks',D.acts.filter(x=>x.gps=='track').length)]}</div>
   ${Object.keys(D.ign).length>0&&html`<p className="mut">Ignored (not runs): ${Object.entries(D.ign).map(([k,v])=>k+' ('+v+')').join(', ')}</p>`}
   ${D.bad>0&&html`<p className="mut">${D.bad} rows skipped: no readable date.</p>`}
   ${D.acts.some(x=>x.gps=='missing')&&html`<p className="mut">Some activities point to GPS files that are not in the ZIP; they will use CSV data only.</p>`}
   ${D.acts.some(x=>x.gps=='unsupported')&&html`<p className="mut">Some GPS files use an unsupported file type; those runs use CSV data only.</p>`}</div>
   <p><button className="btn" onClick=${()=>setGo(true)}>Build my Wrapped ✨</button> <button className="btn alt" onClick=${reset}>Choose another file</button></p></div>`}
 return html`<div className="wrap">
  <header className="home"><div className="blobs" aria-hidden="true"></div>
   <p className="eyebrow">🏃 free · private · no login</p>
   <h1>Your running<br/><span className="grad">Wrapped</span> ✨</h1>
   <p className="tag-line">Drop your Strava export and get your stats, streaks, splits and share cards. All receipts, zero cringe. 🧾</p>
   <label className=${'drop'+(over?' on':'')} onDragOver=${e=>{e.preventDefault();setOver(true)}} onDragLeave=${()=>setOver(false)} onDrop=${e=>{e.preventDefault();setOver(false);load(e.dataTransfer.files[0])}}>
    <b className="n">${busy?'⏳ Reading your export…':'📦 Choose your Strava ZIP'}</b><span className="mut">or drop it here</span>
    <input type="file" accept=".zip,application/zip" hidden onChange=${e=>load(e.target.files[0])}/></label>
   ${err&&html`<div className="err" role="alert">${err}</div>`}
   <p className="mut">🔒 Your file is read in your browser and never uploaded.</p>
   <div className="pills">${['📈 Volume','⏱️ Km splits','🔥 Streaks','🟩 Heatmap','⛰️ Elevation','🐐 Badges','📲 Share cards'].map(t=>html`<span key=${t} className="pill">${t}</span>`)}</div>
   <details className="faq"><summary>🤔 How do I get my export?</summary><p>In Strava: Settings, My Account, Download or Delete Your Account, then request your archive. Strava emails you a ZIP link.</p></details>
  </header>
  <section className="seo"><h2>${INTRO.h}</h2>${INTRO.p.map((t,i)=>html`<p key=${i}>${t}</p>`)}
   <h2>❓ FAQ</h2>${FAQ.map(f=>html`<details key=${f.q} className="faq"><summary>${f.q}</summary><p>${f.a}</p></details>`)}</section>
  <footer>Independent project, not affiliated with Strava.<br/>Vibe coded with love by Shubh Sinha (shrudex)<br/><a href=${X_URL}>X @shrudex</a> · <a href=${LINKEDIN_URL}>LinkedIn</a></footer></div>`}
