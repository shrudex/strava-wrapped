import { MON } from './constants.js';

export function parseCSV(t){const rows=[];let r=[],f='',q=false;for(let i=0;i<t.length;i++){const c=t[i];if(q){if(c=='"'){if(t[i+1]=='"'){f+='"';i++}else q=false}else f+=c}else if(c=='"')q=true;else if(c==','){r.push(f);f=''}else if(c=='\n'||c=='\r'){if(c=='\r'&&t[i+1]=='\n')i++;r.push(f);rows.push(r);r=[];f=''}else f+=c}if(f||r.length){r.push(f);rows.push(r)}return rows}
export function pd(s){const m=/([A-Za-z]{3})\w*\s+(\d{1,2}),\s*(\d{4}),?\s+(\d{1,2}):(\d{2}):?(\d{2})?\s*(AM|PM)?/i.exec(s||'');if(!m){const t=Date.parse(s);return isNaN(t)?null:t}
 let h=+m[4];if(m[7]){h%=12;if(m[7].toUpperCase()=='PM')h+=12}const mo=MON.findIndex(x=>x.toLowerCase()==m[1].toLowerCase());return mo<0?null:Date.UTC(+m[3],mo,+m[2],h,+m[5],+(m[6]||0))}
export const hav=(a,b)=>{const r=Math.PI/180,x=Math.sin((b[0]-a[0])*r/2)**2+Math.cos(a[0]*r)*Math.cos(b[0]*r)*Math.sin((b[1]-a[1])*r/2)**2;return 12742000*Math.asin(Math.sqrt(x))};
export function gpx(txt){
 const d=new DOMParser().parseFromString(txt,'text/xml');
 const P=[...d.getElementsByTagName('trkpt')].map(p=>{const tm=p.getElementsByTagName('time')[0];return[+p.getAttribute('lat'),+p.getAttribute('lon'),tm?Date.parse(tm.textContent)/1000:NaN]}).filter(p=>isFinite(p[0])&&isFinite(p[1])&&isFinite(p[2]));
 if(P.length<10)return null;
 const D=[0],T=[P[0][2]],K=[P[0]];let pv=P[0];
 for(let i=1;i<P.length;i++){const s=hav(pv,P[i]),dt=P[i][2]-pv[2];if(dt<=0||s/dt>12)continue;D.push(D[D.length-1]+s);T.push(P[i][2]);K.push(P[i]);pv=P[i]}
 const tot=D[D.length-1];if(tot<400)return null;
 let p=0;const at=x=>{while(p<D.length-2&&D[p+1]<x)p++;const w=D[p+1]-D[p];return T[p]+(w?(x-D[p])/w:0)*(T[p+1]-T[p])};
 const splits=[];let last=T[0];for(let k=1;k<=Math.floor(tot/1000);k++){p=0;const t=at(k*1000);splits.push(t-last);last=t}
 const best={};[400,1000,2000,3000,5000].forEach(L=>{if(tot<L)return;let m=Infinity;p=0;for(let j=0;j<D.length;j++){if(D[j]<L)continue;const s=D[j]-L;while(p<D.length-2&&D[p+1]<s)p++;const w=D[p+1]-D[p],t0=T[p]+(w?(s-D[p])/w:0)*(T[p+1]-T[p]);m=Math.min(m,T[j]-t0)}best[L]=m});
 p=0;const h1=at(tot/2)-T[0],h2=T[T.length-1]-at(tot/2);
 const st=Math.max(1,Math.floor(K.length/80)),R=K.filter((_,i)=>i%st==0).map(q=>[q[0],q[1]]);
 return{splits,best,h1,h2,tot,R};
}
