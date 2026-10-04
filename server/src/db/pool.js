import pg from 'pg';
import {DATABASE_URL} from '../config/env.js';
export const pool=new pg.Pool({connectionString:DATABASE_URL});
export const q=(s,p)=>pool.query(s,p).then(r=>r.rows);
export const one=async(c,s,p)=>(await c.query(s,p)).rows[0];
export const tx=async f=>{const c=await pool.connect();try{await c.query('BEGIN');const r=await f(c);await c.query('COMMIT');return r}catch(e){await c.query('ROLLBACK');throw e}finally{c.release()}};
