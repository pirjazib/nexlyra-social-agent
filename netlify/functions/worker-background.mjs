import {scheduled} from '../../lib/workflow.mjs';
export default async (req)=>{if(req.method!=='POST'||!process.env.CRON_SECRET||req.headers.get('authorization')!==`Bearer ${process.env.CRON_SECRET}`)return new Response('Forbidden',{status:403});const {slot}=await req.json();if(!['morning','evening'].includes(slot))return new Response('Invalid slot',{status:400});await scheduled(slot);return new Response('OK');};
export const config={background:true};
