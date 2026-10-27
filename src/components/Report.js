import { useState, useMemo, useEffect } from 'react';
import { html } from '../html.js';
import { MON, DAY } from '../lib/constants.js';
import { gpx } from '../lib/parse.js';
import { rng, prv, stats } from '../lib/stats.js';
import { fK, fT, fP, fD, pace } from '../lib/format.js';
import { Bars, Kpi, Route, Share } from './Widgets.js';

export function Report({D,zip,onBack}){
 const A0=D.acts,tm={};A0.forEach(x=>{tm[x.k]=tm[x.k]||{l:x.type,n:0};tm[x.k].n++});
 const tk=Object.keys(tm).sort((p,q)=>tm[q].n-tm[p].n);
 const [sel,setSel]=useState(tk.includes('run')?['run']:tk);
 const years=[...new Set(A0.map(x=>new Date(x.t).getUTCFullYear()))].sort((p,q)=>q-p);
 const [P,setP]=useState({mode:'year',y:years[0],m:new Date(Math.max(...A0.map(x=>x.t))).getUTCMonth(),s:'',e:''});
 const A=useMemo(()=>A0.filter(x=>sel.includes(x.k)).sort((p,q)=>p.t-q.t),[sel]);
 const [a,b]=rng(P),[pa,pb]=prv(P,a,b);
 const S=A.filter(x=>x.t>=a&&x.t<=b),PS=A.filter(x=>x.t>=pa&&x.t<=pb);
 const st=stats(S,a,b),ps=stats(PS,pa,pb);
 const isRun=sel.length==1&&sel[0]=='run';
 const per=P.mode=='year'?''+P.y:P.mode=='month'?MON[P.m]+' '+P.y:P.s+' to '+P.e;
 const [gp,setGp]=useState({});const [prog,setProg]=useState(null);
 const key=S.map(x=>x.id).join();
 useEffect(()=>{let stop=false;const need=S.filter(x=>x.gps=='gpx'&&!(x.id in gp));if(!need.length)return;
  (async()=>{const add={};let i=0;setProg([0,need.length]);for(const x of need){if(stop)return;try{add[x.id]=gpx(await zip.file(x.file).async('string'))||false}catch(e){add[x.id]=false}i++;if(i%3==0||i==need.length){setGp(g=>({...g,...add}));setProg([i,need.length])}await new Promise(r=>setTimeout(r))}setProg(null)})();
  return()=>{stop=true}},[key]);
 const G=S.filter(x=>gp[x.id]).map(x=>({x,g:gp[x.id]}));
 const bestE={};G.forEach(({x,g})=>Object.entries(g.best).forEach(([L,t])=>{if(!bestE[L]||t<bestE[L].t)bestE[L]={t,x}}));
 const lg=G.sort((p,q)=>q.g.tot-p.g.tot)[0];
 const fast5=isRun?S.filter(x=>x.dist>=5000&&pace(x)).sort((p,q)=>pace(p)-pace(q))[0]:null;
 /* milestones */
 const ms=[];if(S.length)ms.push({t:'First activity in this period',d:fD(S[0].t)+' · '+(S[0].name||S[0].type),v:1});
 [[5000,'First 5K'],[10000,'First 10K'],[21097,'First half marathon']].forEach(([th,t])=>{const f=A.find(x=>x.dist>=th);if(f&&f.t>=a&&f.t<=b)ms.push({t,d:fD(f.t)+' · '+fK(f.dist)+' km',v:1})});
 if(st.longest)ms.push({t:'Longest session',d:fK(st.longest.dist)+' km on '+fD(st.longest.t),v:1});
 if(st.busy&&st.busy.n>1)ms.push({t:'Most active month',d:st.busy.l+' with '+st.busy.n+' activities',v:1});
 if(fast5)ms.push({t:'Fastest 5K+ run (average pace)',d:fP(pace(fast5))+' /km on '+fD(fast5.t),v:1});
 /* badges */
 const we=S.filter(x=>[0,6].includes(new Date(x.t).getUTCDay())).length,bd=[];
 if(st.wst>=3)bd.push(['Consistency merchant',st.wst+' active weeks in a row','Needs 3 or more consecutive active weeks']);
 if(S.length>=5&&we/S.length>=.6)bd.push(['Weekend warrior',Math.round(we/S.length*100)+'% of activities on weekends','Needs 5+ activities and 60%+ on Saturday or Sunday']);
 if(st.elev>=1000)bd.push(['Elevation goblin',Math.round(st.elev)+' m climbed','Needs 1,000 m or more total gain']);
 if(st.gap>=14)bd.push(['Comeback arc','Back after a '+st.gap+'-day break','Needs a gap of 14+ days followed by more activity']);
 /* insights */
 const ins=[];
 if(S.length){
  ins.push(st.rpw<2?{t:'Your biggest opportunity is consistency',b:'One extra easy session a week is a gentle way to build rhythm.',e:S.length+' activities over '+st.weeks.toFixed(1)+' weeks ('+st.rpw.toFixed(1)+' per week)'}:{t:'You’ve got a steady rhythm',b:'Regular sessions are the base everything else builds on.',e:st.rpw.toFixed(1)+' activities per week, '+st.days+' active days'});
  if(ps.n&&st.dist!=null&&ps.dist){const ch=(st.dist-ps.dist)/ps.dist*100;ins.push({t:'Distance '+(ch>=0?'up ':'down ')+Math.abs(ch).toFixed(0)+'% on the previous period',b:ps.n<3?'The previous period had few activities, so treat this comparison with care.':'Compared with the equivalent period before this one.',e:fK(st.dist)+' km vs '+fK(ps.dist)+' km'})}
  if(isRun&&lg){const d=(lg.g.h2-lg.g.h1)/lg.g.h1;ins.push(d>.03?{t:'Pacing is uneven',b:'The second half was slower than the first. The data can’t say why; heat, hills or fuelling are all possible.',e:'Second half '+(d*100).toFixed(1)+'% slower on '+fD(lg.x.t)+' (GPS estimate)'}:d<-.02?{t:'Negative split',b:'You ran the second half faster than the first.',e:'Second half '+(-d*100).toFixed(1)+'% faster on '+fD(lg.x.t)+' (GPS estimate)'}:{t:'Even pacing',b:'Your halves were within a few percent of each other.',e:'Halves differ by '+(Math.abs(d)*100).toFixed(1)+'% on '+fD(lg.x.t)+' (GPS estimate)'})}
  if(!S.some(x=>x.hr!=null))ins.push({t:'Add heart-rate data for intensity trends',b:'No heart-rate values were found in this period, so effort trends are not shown.',e:'0 of '+S.length+' activities include heart rate'});
 }
 const cards=[
  {name:'Headline',per,sub:'Strava Wrapped',big:fK(st.dist),unit:'km',lines:[st.n+' activities',fT(st.mt)+' moving',st.elev!=null?Math.round(st.elev)+' m climbed':'Elevation not in data']},
  {name:'Longest',per,sub:'Biggest effort',big:st.longest?fK(st.longest.dist):'—',unit:'km longest session',lines:[st.longest?fD(st.longest.t):'',fast5?'Fastest 5K+ pace '+fP(pace(fast5))+'/km':'Avg '+fK(st.avg)+' km per activity']},
  {name:'Consistency',per,sub:'Showing up',big:''+st.days,unit:'active days',lines:['Longest streak: '+st.streak+' days','Active-week streak: '+st.wst,st.rpw.toFixed(1)+' per week']}
 ];
 const tog=k=>setSel(s=>s.includes(k)?(s.length>1?s.filter(z=>z!=k):s):[...s,k]);
 const bad=P.mode=='custom'&&b<a;
 const useD=st.dn>0;
 const cov=n=>S.filter(n).length+' of '+S.length;
 return html`<div className="wrap">
 <div className="bar">
  <div>${['year','month','custom'].map(m=>html`<button key=${m} className=${'chip'+(P.mode==m?' on':'')} onClick=${()=>setP({...P,mode:m})}>${m[0].toUpperCase()+m.slice(1)}</button>`)}</div>
  <div>${P.mode!='custom'&&years.map(y=>html`<button key=${y} className=${'chip'+(P.y==y?' on':'')} onClick=${()=>setP({...P,y})}>${y}</button>`)}
   ${P.mode=='month'&&html`<select aria-label="Month" value=${P.m} onChange=${e=>setP({...P,m:+e.target.value})}>${MON.map((m,i)=>html`<option key=${i} value=${i}>${m}</option>`)}</select>`}
   ${P.mode=='custom'&&html`<span><input type="date" aria-label="Start date" value=${P.s} onChange=${e=>setP({...P,s:e.target.value})}/> <input type="date" aria-label="End date" value=${P.e} onChange=${e=>setP({...P,e:e.target.value})}/></span>`}</div>
  <div>${tk.map(k=>html`<button key=${k} className=${'chip'+(sel.includes(k)?' on':'')} onClick=${()=>tog(k)}>${tm[k].l} (${tm[k].n})</button>`)}</div>
  <div className="mut">${bad?'End date must not be before the start date.':S.length+' activities in this period · dates in UTC as exported'}</div>
 </div>
 ${!S.length?html`<div className="card"><h2>Nothing here yet</h2><p>No matching activities in this period. Try another year, month or activity type.</p></div>`:html`<div>
 <div className="card hero"><div>Your {per} in motion</div><div className="big">${fK(st.dist)}<small style=${{fontSize:'.3em'}}> km</small></div><p>${st.n} ${isRun?'runs':'activities'} · ${fT(st.mt)} moving · ${st.days} active days</p></div>
 <div className="card"><h2>At a glance</h2><div className="grid">
  ${[Kpi('Activities',st.n),Kpi('Distance (km)',fK(st.dist)),Kpi('Moving time',fT(st.mt)),Kpi('Elevation (m)',st.elev==null?'—':Math.round(st.elev)),Kpi('Active days',st.days),Kpi('Per week',st.rpw.toFixed(1)),Kpi('Longest (km)',st.longest?fK(st.longest.dist):'—'),Kpi('Avg distance (km)',fK(st.avg))]}</div>
  ${!useD&&html`<p className="mut">No distance values in this selection, so distance shows as unavailable.</p>`}</div>
 <div className="card"><h2>${st.weekly?'Week by week':'Month by month'}</h2>
  <${Bars} v=${st.bars.map(x=>useD?x.d/1000:x.n)} l=${st.bars.map(x=>x.l)} tops=${st.bars.map(x=>useD?(x.d?Math.round(x.d/1000):''):(x.n||''))} label=${(useD?'Distance in km':'Activity count')+' per '+(st.weekly?'week':'month')+': '+st.bars.map(x=>x.l+' '+(useD?fK(x.d)+' km':x.n)).join(', ')}/>
  <h2 style=${{marginTop:18}}>Day of the week</h2>
  <${Bars} v=${st.wd} l=${['M','T','W','T','F','S','S']} tops=${st.wd.map(x=>x||'')} h=${70} c="var(--b)" label=${'Activities by weekday Monday to Sunday: '+st.wd.join(', ')}/></div>
 <div className="card"><h2>Consistency</h2><div className="grid">${[Kpi('Longest streak (days)',st.streak),Kpi('Active-week streak',st.wst),Kpi('Longest gap (days)',st.gap),Kpi('Active days',st.days+' / '+Math.max(1,Math.round(Math.min(b,Date.now())/DAY-a/DAY)))]}</div>
  <p className="mut">Streaks use UTC calendar days; weeks start on Monday. Denominator: the selected period up to today.</p></div>
 <div className="card"><h2>Records and milestones</h2>${ms.map((m,i)=>html`<div className="bdg" key=${i}><b>${m.t}</b><span className="tag">from CSV</span><div className="mut">${m.d}</div></div>`)}</div>
 ${isRun?html`<div className="card"><h2>Run deep dive</h2>
  ${prog&&html`<p className="mut">Reading GPS files: ${prog[0]} of ${prog[1]}…</p>`}
  ${!G.length&&!prog?html`<p>No usable GPX tracks for these runs, so splits and best efforts are unavailable. Everything else still uses the CSV.</p>`:null}
  ${Object.keys(bestE).length?html`<table><tr><th>Best effort<span className="tag">GPS estimate</span></th><th>Time</th><th>Pace</th><th>Date</th></tr>${Object.entries(bestE).map(([L,r])=>html`<tr key=${L}><td>${L==400?'400 m':L/1000+' km'}</td><td>${fP(r.t)}</td><td>${fP(r.t/(L/1000))}/km</td><td>${fD(r.x.t)}</td></tr>`)}</table>`:null}
  ${lg&&html`<div><h2 style=${{margin:'18px 0 8px'}}>Splits: ${fD(lg.x.t)}, ${fK(lg.g.tot)} km</h2>
   <${Bars} v=${lg.g.splits.map(s=>1/s)} l=${lg.g.splits.map((_,i)=>i+1)} tops=${lg.g.splits.map(fP)} h=${90} c="var(--a)" label=${'Pace per km: '+lg.g.splits.map(fP).join(', ')}/>
   <p className="mut">Taller bar means faster km. First half ${fP(lg.g.h1/(lg.g.tot/2000))}/km, second half ${fP(lg.g.h2/(lg.g.tot/2000))}/km (elapsed time, so stops count).</p>
   <${Route} R=${lg.g.R}/></div>`}</div>`:html`<div className="card"><h2>Pace and splits</h2><p className="mut">Pace and GPS split analysis is shown for running only, so pace is never compared across sports. Select just Run to see it.</p></div>`}
 ${bd.length>0&&html`<div className="card"><h2>GOATed badges</h2>${bd.map((x,i)=>html`<div className="bdg" key=${i}><b>${x[0]}</b><div>${x[1]}</div><div className="mut">${x[2]}</div></div>`)}</div>`}
 <div className="card"><h2>Insights</h2>${ins.map((x,i)=>html`<div className="bdg" key=${i}><b>${x.t}</b><div>${x.b}</div><div className="mut">Evidence: ${x.e}</div></div>`)}
  <p className="mut">Rule-based, general fitness guidance only, not medical advice.</p></div>
 <div className="card"><h2>Activity log</h2><div style=${{overflowX:'auto'}}><table><tr><th>Date</th><th>Type</th><th>km</th><th>Time</th>${isRun&&html`<th>Pace</th>`}</tr>
  ${S.slice().reverse().slice(0,60).map(x=>html`<tr key=${x.id}><td>${fD(x.t)}</td><td>${x.type}</td><td>${fK(x.dist)}</td><td>${fT(x.mt)}</td>${isRun&&html`<td>${fP(pace(x))}</td>`}</tr>`)}</table></div>
  ${S.length>60&&html`<p className="mut">Showing the latest 60 of ${S.length}.</p>`}</div>
 <${Share} cards=${cards}/>
 <div className="card"><h2>Data coverage and caveats</h2><ul>
  <li>Distance present: ${cov(x=>x.dist!=null)}</li><li>Moving time present: ${cov(x=>x.mt!=null)}</li><li>Heart rate present: ${cov(x=>x.hr!=null)}</li>
  <li>GPX tracks matched: ${cov(x=>x.gps=='gpx')}${S.some(x=>x.gps=='unsupported')?' ('+S.filter(x=>x.gps=='unsupported').length+' use unsupported formats such as FIT)':''}</li>
  <li>Missing values are shown as unavailable, never as zero.</li><li>GPS-derived records are estimates and can be off by a few seconds.</li></ul></div></div>`}
 <p><button className="btn alt" onClick=${onBack}>Clear data and start over</button></p>
 <footer>Independent project, not affiliated with or endorsed by Strava.<br/>Vibe coded with love by Shubh Sinha (shrudex)</footer></div>`}
