import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import {q,tx,one} from '../db/pool.js';
import {FEE,DISC,SEC} from '../config/env.js';
import {h,E,pub,tok,STAFF} from '../utils/helpers.js';

export const postExpenses=h(async(req,res)=>{const b=req.body;if(!(b.amount>0))throw E(400,'Enter an amount');res.json((await q('insert into expenses(user_id,amount,description,receipt_url,event_id) values($1,$2,$3,$4,$5) returning *',[req.u.id,b.amount,b.description,b.receipt_url,b.event_id||null]))[0])});

export const getExpenses=h(async(req,res)=>{const st=STAFF.includes(req.u.role);res.json(await q('select x.*,u.name claimant from expenses x join users u on u.id=x.user_id '+(st?'':'where user_id=$1 ')+'order by x.id desc',st?[]:[req.u.id]))});

export const putExpensesId=h(async(req,res)=>{await tx(async c=>{const x=await one(c,'select * from expenses where id=$1 for update',[req.params.id]);if(!x||x.status==='reimbursed')throw E(409,'Already reimbursed');if(req.body.status==='reimbursed'&&!x.receipt_url)throw E(400,'Receipt required before reimbursing');
await c.query('update expenses set status=$1 where id=$2',[req.body.status,x.id]);if(req.body.status==='reimbursed')await c.query("insert into ledger(type,source,amount,description,event_id) values('expense','reimbursement',$1,$2,$3)",[x.amount,'Reimbursed: '+x.description,x.event_id])});res.json({ok:1})});

export const postLedger=h(async(req,res)=>{const b=req.body;res.json((await q('insert into ledger(type,source,amount,description,event_id) values($1,$2,$3,$4,$5) returning *',[b.type,b.source||'other',b.amount,b.description,b.event_id||null]))[0])});

export const getFinance=h(async(_,res)=>{const l=await q('select l.*,e.title event from ledger l left join events e on e.id=event_id order by l.id desc');const sum=f=>l.filter(f).reduce((a,x)=>a+x.amount,0),src={};l.forEach(x=>{const k=x.type+':'+x.source;src[k]=(src[k]||0)+x.amount});
res.json({income:sum(x=>x.type=='income'),expense:sum(x=>x.type=='expense'),sources:src,events:await q("select e.id,e.title,coalesce(sum(amount) filter(where type='income'),0)::int income,coalesce(sum(amount) filter(where type='expense'),0)::int expense from events e left join ledger l on l.event_id=e.id group by e.id order by e.starts_at desc"),entries:l})});
