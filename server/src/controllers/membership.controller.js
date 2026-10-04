import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import {q,tx,one} from '../db/pool.js';
import {FEE,DISC,SEC} from '../config/env.js';
import {h,E,pub,tok,STAFF} from '../utils/helpers.js';

export const getMembershipPrice=(_,res)=>res.json({fee:FEE,discount:DISC});

export const postMembershipBuy=h(async(req,res)=>res.json(await tx(async c=>{const u=await one(c,'select * from users where id=$1 for update',[req.u.id]);const now=new Date(),base=u.member_until&&new Date(u.member_until)>now?new Date(u.member_until):now,until=new Date(base.getTime()+365*864e5),code=u.member_code||'SKY-'+crypto.randomBytes(3).toString('hex').toUpperCase();
await c.query('update users set member_code=$1,member_until=$2 where id=$3',[code,until,u.id]);await c.query('insert into memberships(user_id,amount,valid_until) values($1,$2,$3)',[u.id,FEE,until]);await c.query("insert into ledger(type,source,amount,description) values('income','dues',$1,$2)",[FEE,'Membership – '+u.name]);return pub(await one(c,'select * from users where id=$1',[u.id]))})));

export const getMembers=h(async(_,res)=>res.json(await q('select u.id,u.name,u.email,u.member_code,u.member_until,(select count(*) from tickets t where t.user_id=u.id)::int tickets,(select count(*) from orders o where o.user_id=u.id)::int orders from users u where member_code is not null order by member_until desc')));

export const getVerifyCode=h(async(req,res)=>{const u=(await q('select name,member_until from users where member_code=$1',[req.params.code.toUpperCase()]))[0];res.json(u?{name:u.name,valid:new Date(u.member_until)>new Date(),until:u.member_until}:{valid:false})});
