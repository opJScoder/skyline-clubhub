import jwt from 'jsonwebtoken';
import {SEC} from '../config/env.js';
/** auth() = any logged-in user; auth('admin','treasurer') = only those roles */
export const auth=(...roles)=>(req,res,next)=>{
  try{req.u=jwt.verify((req.headers.authorization||'').slice(7),SEC)}catch{return res.status(401).json({error:'Please log in'})}
  if(roles.length&&!roles.includes(req.u.role))return res.status(403).json({error:'You do not have access to this'});
  next();
};
