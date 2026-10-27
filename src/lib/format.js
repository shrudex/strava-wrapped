import { MON } from './constants.js';

export const fK=m=>m==null?'—':(m/1000).toFixed(m>=1e5?0:1);
export const fT=s=>{if(s==null)return'—';const h=Math.floor(s/3600),m=Math.floor(s%3600/60);return h?h+'h '+m+'m':m+'m'};
export const fP=s=>{if(s==null||!isFinite(s))return'—';s=Math.round(s);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
export const fD=t=>{const d=new Date(t);return d.getUTCDate()+' '+MON[d.getUTCMonth()]+' '+d.getUTCFullYear()};
export const pace=x=>x.dist>0&&x.mt>0?x.mt/(x.dist/1000):null;
