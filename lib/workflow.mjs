import crypto from 'node:crypto';
import {settings,savePost,getPost,listPosts,recordRun} from './db.mjs';
import {createContent} from './content.mjs';
import {linkedin,xPost} from './publish.mjs';
const id=()=>crypto.randomUUID();
export async function generate(slot='morning',opts={}){if(!['morning','evening'].includes(slot))throw Error('Invalid slot');const day=Math.floor(Date.now()/86400000);const content=await createContent(slot,day);const recent=await listPosts();if(recent.some(p=>p.headline===content.headline && Date.now()-new Date(p.createdAt).getTime()<5*86400000))throw Error('Duplicate headline within five days; generate again later');const cfg=await settings();const post={id:id(),createdAt:new Date().toISOString(),slot,...content,image:typeof opts.image==='boolean'?opts.image:(cfg.images && (day+ (slot==='evening'?1:0))%3!==0),approved:false,status:{linkedin:'draft',x:'draft'},remoteIds:{},errors:{}};await savePost(post);return post;}
export async function publish(post,networks=['linkedin','x']){const cfg=await settings();if(cfg.paused)throw Error('Publishing kill switch enabled');if(cfg.approvalRequired&&!post.approved)throw Error('Post not approved');for(const platform of networks){if(post.status?.[platform]==='published')continue; // don't blindly retry ambiguous attempts
 if(post.status?.[platform]==='publishing')continue;
 post.status[platform]='publishing';await savePost(post);
 try{const remote=platform==='linkedin'?await linkedin(post):await xPost(post);post.status[platform]='published';post.remoteIds[platform]=remote;delete post.errors[platform];}
 catch(e){post.status[platform]='review_required';post.errors[platform]=String(e.message||e).slice(0,500);}await savePost(post);}
 return post;}
export async function scheduled(slot){const run={id:id(),slot,startedAt:new Date().toISOString(),status:'started',note:''};await recordRun(run);try{const cfg=await settings();if(cfg.paused){run.status='skipped';run.note='Emergency pause enabled';return run;}
 const today=new Date().toISOString().slice(0,10);const existing=(await listPosts()).find(p=>p.createdAt.startsWith(today)&&p.slot===slot);let post=existing||await generate(slot);run.postId=post.id;
 if(cfg.autoPublish){if(cfg.approvalRequired && !post.approved){run.status='draft_ready';run.note='Awaiting your approval';}else{post=await publish(post);run.status=Object.values(post.status).every(s=>s==='published')?'published':'review_required';run.note=JSON.stringify(post.errors);}}
 else{run.status='draft_ready';run.note='Automatic publishing disabled';}return run;
 }catch(e){run.status='error';run.note=String(e.message||e).slice(0,500);return run;}finally{run.finishedAt=new Date().toISOString();await recordRun(run);}}
export async function applyEdit(post,data){if(Object.values(post.status).some(s=>s==='published'||s==='publishing'))throw Error('Published/in-flight drafts cannot be edited');if(typeof data.linkedin==='string')post.linkedin=data.linkedin.slice(0,2800);if(typeof data.x==='string')post.x=data.x.slice(0,270);if(typeof data.headline==='string')post.headline=data.headline.slice(0,120);if(typeof data.image==='boolean')post.image=data.image;if(typeof data.approved==='boolean')post.approved=data.approved;await savePost(post);return post;}
