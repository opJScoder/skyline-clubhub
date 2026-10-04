import jwt from 'jsonwebtoken';
import {SEC} from '../config/env.js';
export const STAFF=['admin','treasurer'];
export const h=f=>(req,res,next)=>f(req,res,next).catch(next);
export const E=(c,m)=>Object.assign(new Error(m),{c});
export const pub=u=>({id:u.id,name:u.name,email:u.email,role:u.role,member_code:u.member_code,member_until:u.member_until,is_member:!!u.member_until&&new Date(u.member_until)>new Date()});
export const tok=u=>({token:jwt.sign({id:u.id,role:u.role},SEC,{expiresIn:'7d'}),user:pub(u)});
