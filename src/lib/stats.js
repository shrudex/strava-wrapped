import { MON, DAY } from './constants.js';

export const rng=P=>{if(P.mode=='year')return[Date.UTC(P.y,0,1),Date.UTC(P.y+1,0,1)-1];if(P.mode=='month')return[Date.UTC(P.y,P.m,1),Date.UTC(P.y,P.m+1,1)-1];if(!P.s||!P.e||P.e<P.s)return[0,-1];return[Date.parse(P.s+'T00:00:00Z'),Date.parse(P.e+'T23:59:59Z')]};
export const prv=(P,a,b)=>P.mode=='year'?rng({mode:'year',y:P.y-1}):P.mode=='month'?rng(P.m?{mode:'month',y:P.y,m:P.m-1}:{mode:'month',y:P.y-1,m:11}):(b<a?[0,-1]:[a-(b-a+1),a-1]);
export const sum=(S,k)=>{const v=S.filter(x=>x[k]!=null);return v.length?v.reduce((s,x)=>s+x[k],0):null};
export const dk=t=>Math.floor(t/DAY),wk=t=>Math.floor((dk(t)+3)/7),mk=t=>{const d=new Date(t);return d.getUTCFullYear()*12+d.getUTCMonth()};
export function stats(S,a,b){
 const days=[...new Set(S.map(x=>dk(x.t)))].sort((p,q)=>p-q);let streak=0,cur=0,gap=0,gapAfter=false;
 days.forEach((d,i)=>{cur=i&&d-days[i-1]==1?cur+1:1;streak=Math.max(streak,cur);if(i&&d-days[i-1]-1>gap)gap=d-days[i-1]-1});
 gapAfter=gap>0;
 const ws=[...new Set(S.map(x=>wk(x.t)))].sort((p,q)=>p-q);let wst=0,wc=0;ws.forEach((w,i)=>{wc=i&&w-ws[i-1]==1?wc+1:1;wst=Math.max(wst,wc)});
 const end=Math.min(b,Date.now()),weeks=Math.max(1,(end-a+1)/(7*DAY));
 const wd=Array(7).fill(0);S.forEach(x=>wd[(new Date(x.t).getUTCDay()+6)%7]++);
 const dist=sum(S,'dist'),dn=S.filter(x=>x.dist!=null).length;
 const bk={},weekly=(end-a)<=70*DAY;S.forEach(x=>{const k=weekly?wk(x.t):mk(x.t);bk[k]=bk[k]||{n:0,d:0};bk[k].n++;bk[k].d+=x.dist||0});
 const bars=[];if(b>=a){if(weekly){for(let w=wk(a);w<=wk(end);w++){const d=new Date((w*7-3)*DAY);bars.push({l:d.getUTCDate()+'/'+(d.getUTCMonth()+1),...(bk[w]||{n:0,d:0})})}}else{for(let k=mk(a);k<=mk(end)&&bars.length<60;k++)bars.push({l:MON[k%12],...(bk[k]||{n:0,d:0})})}}
 const longest=S.filter(x=>x.dist!=null).sort((p,q)=>q.dist-p.dist)[0]||null;
 const busy=bars.length&&!weekly?bars.reduce((m,x)=>x.n>m.n?x:m,bars[0]):null;
 return{n:S.length,dist,dn,mt:sum(S,'mt'),elev:sum(S,'elev'),days:days.length,streak,gap,gapAfter,wst,weeks,rpw:S.length/weeks,wd,bars,weekly,longest,busy,avg:dn?dist/dn:null};
}
