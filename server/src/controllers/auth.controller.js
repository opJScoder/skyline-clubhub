import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import {q,tx,one} from '../db/pool.js';
import {FEE,DISC,SEC} from '../config/env.js';
import {h,E,pub,tok,STAFF} from '../utils/helpers.js';

export const postAuthRegister=h(async(req,res)=>{const{name,email,password}=req.body;if(!name||!/^\S+@\S+\.\S+$/.test(email||'')||(password||'').length<6)throw E(400,'Enter name, valid email and a password of 6+ characters');
if((await q('select 1 from users where email=$1',[email.toLowerCase()])).length)throw E(409,'Email already registered');
res.json(tok((await q('insert into users(name,email,password) values($1,$2,$3) returning *',[name.trim(),email.toLowerCase(),await bcrypt.hash(password,10)]))[0]))});

export const postAuthLogin=h(async(req,res)=>{const u=(await q('select * from users where email=$1',[(req.body.email||'').toLowerCase()]))[0];if(!u||!await bcrypt.compare(req.body.password||'',u.password))throw E(401,'Wrong email or password');res.json(tok(u))});

export const getMe=h(async(req,res)=>res.json(pub((await q('select * from users where id=$1',[req.u.id]))[0])));
