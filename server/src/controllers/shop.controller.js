import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import {q,tx,one} from '../db/pool.js';
import {FEE,DISC,SEC} from '../config/env.js';
import {h,E,pub,tok,STAFF} from '../utils/helpers.js';

export const getProducts=h(async(_,res)=>res.json(await q('select * from products order by id desc')));

export const postProducts=h(async(req,res)=>{const b=req.body;res.json((await q('insert into products(name,description,price,image,sizes) values($1,$2,$3,$4,$5) returning *',[b.name,b.description,b.price,b.image,b.sizes||{}]))[0])});

export const putProductsId=h(async(req,res)=>{const b=req.body;res.json((await q('update products set name=$1,description=$2,price=$3,image=$4,sizes=$5 where id=$6 returning *',[b.name,b.description,b.price,b.image,b.sizes,req.params.id]))[0])});

export const deleteProductsId=h(async(req,res)=>{await q('delete from products where id=$1',[req.params.id]);res.json({ok:1})});

export const postOrders=h(async(req,res)=>{const{product_id,size}=req.body,qty=Math.max(1,+req.body.qty||1);res.json(await tx(async c=>{const p=await one(c,'select * from products where id=$1 for update',[product_id]);if(!p)throw E(404,'Product not found');const left=+p.sizes[size]||0;if(left<qty)throw E(409,left?`Only ${left} left in ${size}`:`${size} is out of stock`);
const u=await one(c,'select member_until from users where id=$1',[req.u.id]),mem=u.member_until&&new Date(u.member_until)>new Date(),gross=p.price*qty,disc=mem?Math.round(gross*DISC/100):0;p.sizes[size]=left-qty;
await c.query('update products set sizes=$1 where id=$2',[p.sizes,p.id]);const o=await one(c,'insert into orders(user_id,product_id,product_name,size,qty,total,discount) values($1,$2,$3,$4,$5,$6,$7) returning *',[req.u.id,p.id,p.name,size,qty,gross-disc,disc]);
await c.query("insert into ledger(type,source,amount,description) values('income','merchandise',$1,$2)",[o.total,`${qty}× ${p.name} (${size})`]);return o}))});

export const getOrdersMine=h(async(req,res)=>res.json(await q('select * from orders where user_id=$1 order by id desc',[req.u.id])));

export const getOrders=h(async(_,res)=>res.json(await q('select o.*,u.name buyer,(u.member_until>now()) member from orders o join users u on u.id=o.user_id order by o.id desc')));

export const putOrdersId=h(async(req,res)=>{await q('update orders set status=$1 where id=$2',[req.body.status,req.params.id]);res.json({ok:1})});
