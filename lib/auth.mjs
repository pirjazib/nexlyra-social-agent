import crypto from 'node:crypto';
function secret(){return process.env.SESSION_SECRET||'';}
const same=(a,b)=>{const x=Buffer.from(String(a||''));const y=Buffer.from(String(b||''));return x.length===y.length&&crypto.timingSafeEqual(x,y);};
export function checkPassword(v){return !!process.env.DASHBOARD_PASSWORD && same(v,process.env.DASHBOARD_PASSWORD);}
export function token(){if(!secret())throw Error('SESSION_SECRET missing');const exp=Date.now()+12*3600_000;const data=`v1.${exp}`;const h=crypto.createHmac('sha256',secret()).update(data).digest('hex');return `${data}.${h}`;}
export function isAuthenticated(request){if(!secret())return false;const c=request.headers.get('cookie')||'';const t=(c.match(/(?:^|;\s*)nx_session=([^;]+)/)||[])[1];if(!t)return false;const [v,exp,mac]=t.split('.');if(v!=='v1'||!/^\d+$/.test(exp)||Date.now()>Number(exp)||!mac)return false;return same(mac,crypto.createHmac('sha256',secret()).update(`${v}.${exp}`).digest('hex'));}
export function requireAuth(req){if(!isAuthenticated(req))return new Response(JSON.stringify({error:'Unauthorized'}),{status:401,headers:{'content-type':'application/json','cache-control':'no-store'}});if(!['GET','HEAD'].includes(req.method)){const origin=req.headers.get('origin');if(!origin||origin!==new URL(req.url).origin)return new Response(JSON.stringify({error:'Invalid origin'}),{status:403});}return null;}
export const json=(obj,status=200)=>new Response(JSON.stringify(obj),{status,headers:{'content-type':'application/json','cache-control':'no-store'}});
