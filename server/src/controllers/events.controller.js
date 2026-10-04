import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import {q,tx,one} from '../db/pool.js';
import {FEE,DISC,SEC} from '../config/env.js';
import {h,E,pub,tok,STAFF} from '../utils/helpers.js';
const EV=['title','description','venue','starts_at','capacity','price','member_price','status'];

export const getEvents=h(async(_,res)=>res.json(await q("select e.*,e.capacity-(select count(*) from tickets t where t.event_id=e.id)::int seats_left from events e where status='published' order by starts_at")));

export const getEventsAll=h(async(_,res)=>res.json(await q('select e.*,e.capacity-(select count(*) from tickets t where t.event_id=e.id)::int seats_left from events e order by starts_at desc')));

export const postEvents=h(async(req,res)=>{const b=req.body;res.json((await q(`insert into events(${EV}) values($1,$2,$3,$4,$5,$6,$7,$8) returning *`,EV.map(k=>b[k]??(k=='status'?'published':null))))[0])});

export const putEventsId=h(async(req,res)=>res.json((await q(`update events set ${EV.map((k,i)=>k+'=$'+(i+1))} where id=$9 returning *`,[...EV.map(k=>req.body[k]),req.params.id]))[0]));

export const deleteEventsId=h(async(req,res)=>{await q('delete from events where id=$1',[req.params.id]);res.json({ok:1})});

export const postEventsIdBuy=h(async(req,res)=>{const n=Math.max(1,Math.min(+req.body.qty||1,10));res.json(await tx(async c=>{const e=await one(c,'select * from events where id=$1 for update',[req.params.id]);if(!e||e.status!=='published')throw E(404,'Event not available');
const sold=+(await one(c,'select count(*) from tickets where event_id=$1',[e.id])).count;if(sold+n>e.capacity)throw E(409,e.capacity-sold>0?`Only ${e.capacity-sold} seats left`:'Sold out');
const u=await one(c,'select member_until from users where id=$1',[req.u.id]),price=u.member_until&&new Date(u.member_until)>new Date()?e.member_price:e.price,t=[];
for(let i=0;i<n;i++)t.push(await one(c,'insert into tickets(event_id,user_id,code,price) values($1,$2,$3,$4) returning *',[e.id,req.u.id,'TK'+crypto.randomBytes(5).toString('hex').toUpperCase(),price]));
await c.query("insert into ledger(type,source,amount,description,event_id) values('income','tickets',$1,$2,$3)",[price*n,`${n} ticket(s) – ${e.title}`,e.id]);return t}))});

export const getTicketsMine=h(async(req,res)=>res.json(await q('select t.*,e.title,e.venue,e.starts_at from tickets t join events e on e.id=t.event_id where user_id=$1 order by t.id desc',[req.u.id])));

export const postCheckin=h(async(req,res)=>{const t=(await q('select t.*,e.title,u.name from tickets t join events e on e.id=t.event_id join users u on u.id=t.user_id where code=$1',[(req.body.code||'').trim().toUpperCase()]))[0];if(!t)throw E(404,'Invalid ticket');if(t.checked_in)throw E(409,`Already checked in (${t.name})`);await q('update tickets set checked_in=true,checked_at=now() where id=$1',[t.id]);res.json({ok:1,name:t.name,event:t.title})});

export const getEventsIdReport=h(async(req,res)=>res.json({summary:(await q("select count(*)::int sold,count(*) filter(where checked_in)::int attended,coalesce(sum(price),0)::int revenue from tickets where event_id=$1",[req.params.id]))[0],spend:(await q("select coalesce(sum(amount),0)::int v from ledger where type='expense' and event_id=$1",[req.params.id]))[0].v,attendees:await q('select u.name,u.email,(u.member_until>now()) member,t.code,t.price,t.checked_in from tickets t join users u on u.id=t.user_id where event_id=$1 order by t.id',[req.params.id])}));
