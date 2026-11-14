import { getStore } from '@netlify/blobs';
const store = () => getStore({name:'nexlyra-social-v21',consistency:'strong'});
export async function settings(){return (await store().get('settings',{type:'json'})) || {autoPublish:false,approvalRequired:true,paused:false,images:true};}
export async function setSettings(update){const merged={...await settings(),...update};await store().setJSON('settings',merged);return merged;}
export async function savePost(post){await store().setJSON(`post:${post.id}`,post);return post;}
export async function getPost(id){if(!/^[a-zA-Z0-9_-]{6,80}$/.test(id||''))return null;return await store().get(`post:${id}`,{type:'json'});}
export async function listPosts(){let cursor;const keys=[];do {const r=await store().list({prefix:'post:',cursor});keys.push(...r.blobs.map(b=>b.key));cursor=r.cursor;}while(cursor);const all=await Promise.all(keys.map(k=>store().get(k,{type:'json'})));return all.filter(Boolean).sort((a,b)=>b.createdAt.localeCompare(a.createdAt)).slice(0,120);}
export async function recordRun(run){await store().setJSON(`run:${run.id}`,run);}
export async function listRuns(){let cursor;const keys=[];do {const r=await store().list({prefix:'run:',cursor});keys.push(...r.blobs.map(b=>b.key));cursor=r.cursor;}while(cursor);return (await Promise.all(keys.map(k=>store().get(k,{type:'json'})))).filter(Boolean).sort((a,b)=>b.startedAt.localeCompare(a.startedAt)).slice(0,30);}
