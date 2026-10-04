import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import {q,tx,one} from '../db/pool.js';
import {FEE,DISC,SEC} from '../config/env.js';
import {h,E,pub,tok,STAFF} from '../utils/helpers.js';

export const getUsers=h(async(_,res)=>res.json(await q('select id,name,email,role,member_code,member_until,created_at from users order by id')));

export const putUsersIdRole=h(async(req,res)=>{if(!['user','treasurer','admin'].includes(req.body.role))throw E(400,'Bad role');await q('update users set role=$1 where id=$2',[req.body.role,req.params.id]);res.json({ok:1})});

export const deleteUsersId=h(async(req,res)=>{if(+req.params.id===req.u.id)throw E(400,'You cannot delete yourself');await q('delete from users where id=$1',[req.params.id]);res.json({ok:1})});
