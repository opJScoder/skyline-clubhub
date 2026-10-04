import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import {q,tx,one} from '../db/pool.js';
import {FEE,DISC,SEC} from '../config/env.js';
import {h,E,pub,tok,STAFF} from '../utils/helpers.js';

export const getFundraisers=h(async(req,res)=>{const st=STAFF.includes(req.u.role);const f=await q("select f.*,coalesce((select sum(amount) from ledger where source='fundraiser' and description like '[F'||f.id||']%'),0)::int raised from fundraisers f order by id desc");const t=await q('select t.*,u.name assignee from tasks t left join users u on u.id=t.assignee_id '+(st?'':'where t.assignee_id=$1 ')+'order by t.id',st?[]:[req.u.id]);res.json(f.map(x=>({...x,tasks:t.filter(k=>k.fundraiser_id===x.id)})).filter(x=>st||x.tasks.length))});

export const postFundraisers=h(async(req,res)=>res.json((await q('insert into fundraisers(title,goal,event_date) values($1,$2,$3) returning *',[req.body.title,req.body.goal||0,req.body.event_date||null]))[0]));

export const deleteFundraisersId=h(async(req,res)=>{await q('delete from fundraisers where id=$1',[req.params.id]);res.json({ok:1})});

export const postFundraisersIdTasks=h(async(req,res)=>{const b=req.body;res.json((await q('insert into tasks(fundraiser_id,title,assignee_id,due) values($1,$2,$3,$4) returning *',[req.params.id,b.title,b.assignee_id||null,b.due||null]))[0])});

export const putTasksId=h(async(req,res)=>{const t=(await q('select * from tasks where id=$1',[req.params.id]))[0];if(!t||(!STAFF.includes(req.u.role)&&t.assignee_id!==req.u.id))throw E(403,'Not your task');await q('update tasks set status=$1 where id=$2',[req.body.status,t.id]);res.json({ok:1})});

export const deleteTasksId=h(async(req,res)=>{await q('delete from tasks where id=$1',[req.params.id]);res.json({ok:1})});

export const postFundraisersIdRaised=h(async(req,res)=>{await q("insert into ledger(type,source,amount,description) values('income','fundraiser',$1,$2)",[req.body.amount,`[F${req.params.id}] ${req.body.note||'Fundraiser income'}`]);res.json({ok:1})});
